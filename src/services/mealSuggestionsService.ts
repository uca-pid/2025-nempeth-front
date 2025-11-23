// Servicio para manejar la autenticación y obtención de sugerencias de comidas
const TOKEN_STORAGE_KEY = 'meal_suggestions_token'
const TOKEN_EXPIRY_KEY = 'meal_suggestions_token_expiry'
const TOKEN_DURATION = 24 * 60 * 60 * 1000 // 24 horas en milisegundos

interface TokenResponse {
  success: boolean
  data: {
    token: string
    expiresIn: string
  }
  message: string
}

interface MealData {
  name: string
}

interface MealResponse {
  success: boolean
  count: number
  data: MealData[]
}

class MealSuggestionsService {
  private tokenPromise: Promise<string> | null = null

  /**
   * Verifica si el token almacenado sigue siendo válido
   */
  private isTokenValid(): boolean {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)

    if (!token || !expiry) {
      return false
    }

    const expiryTime = parseInt(expiry, 10)
    const now = Date.now()

    // Consideramos el token válido si faltan más de 5 minutos para expirar
    // Esto previene race conditions
    return now < expiryTime - (5 * 60 * 1000)
  }

  /**
   * Obtiene el token almacenado si es válido
   */
  private getStoredToken(): string | null {
    if (this.isTokenValid()) {
      return localStorage.getItem(TOKEN_STORAGE_KEY)
    }
    return null
  }

  /**
   * Almacena el token y su tiempo de expiración
   */
  private storeToken(token: string): void {
    const expiryTime = Date.now() + TOKEN_DURATION
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
  }

  /**
   * Limpia el token almacenado
   */
  private clearToken(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
  }

  /**
   * Obtiene un nuevo token del servidor
   */
  private async fetchNewToken(): Promise<string> {
    const response = await fetch('https://que-comemos-api.vercel.app/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientName: 'Korven' }),
    })

    if (!response.ok) {
      throw new Error(`Error al obtener token: ${response.status}`)
    }

    const data: TokenResponse = await response.json()
    
    if (!data.success || !data.data || !data.data.token) {
      throw new Error('Token no recibido del servidor')
    }

    return data.data.token
  }

  /**
   * Obtiene un token válido (del caché o solicitando uno nuevo)
   * Maneja múltiples solicitudes simultáneas de forma eficiente
   */
  async getToken(): Promise<string> {
    // Si ya tenemos un token válido en caché, lo usamos
    const storedToken = this.getStoredToken()
    if (storedToken) {
      return storedToken
    }

    // Si ya hay una solicitud de token en progreso, esperamos su resultado
    if (this.tokenPromise) {
      return this.tokenPromise
    }

    // Creamos una nueva solicitud de token
    this.tokenPromise = this.fetchNewToken()
      .then(token => {
        this.storeToken(token)
        this.tokenPromise = null
        return token
      })
      .catch(error => {
        this.tokenPromise = null
        this.clearToken()
        throw error
      })

    return this.tokenPromise
  }

  /**
   * Obtiene las sugerencias de comidas desde la API
   */
  async getMeals(): Promise<MealData[]> {
    try {
      const token = await this.getToken()

      const response = await fetch('https://que-comemos-api.vercel.app/api/meals', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        // Token inválido o expirado, limpiamos el caché e intentamos de nuevo
        this.clearToken()
        const newToken = await this.getToken()
        
        const retryResponse = await fetch('https://que-comemos-api.vercel.app/api/meals', {
          headers: {
            'Authorization': `Bearer ${newToken}`,
          },
        })

        if (!retryResponse.ok) {
          throw new Error(`Error al obtener sugerencias: ${retryResponse.status}`)
        }

        const retryData: MealResponse = await retryResponse.json()
        return retryData.data || []
      }

      if (!response.ok) {
        throw new Error(`Error al obtener sugerencias: ${response.status}`)
      }

      const data: MealResponse = await response.json()
      
      if (!data.success) {
        throw new Error('Respuesta inválida del servidor')
      }

      return data.data || []
    } catch (error) {
      console.error('Error en getMeals:', error)
      throw error
    }
  }

  /**
   * Limpia manualmente el token del caché (útil para testing o logout)
   */
  clearCache(): void {
    this.clearToken()
    this.tokenPromise = null
  }
}

// Exportamos una instancia singleton
export const mealSuggestionsService = new MealSuggestionsService()
export type { MealData, MealResponse }
