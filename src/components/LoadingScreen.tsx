import Lottie from 'lottie-react'
import loadingAnimation from '../assets/HoneyBee.json'
import '../Styles/colores.css'

interface LoadingScreenProps {
  message?: string
}

function LoadingScreen({ message = 'Cargando datos...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex h-dvh w-screen items-center justify-center bg-gradient-to-b from-white via-[#fff1eb] to-white p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-[600px] bg-transparent text-center px-4 sm:px-6 py-6 animate-slideIn">
        <div className="flex justify-center mb-6 sm:mb-0">
          <Lottie
            animationData={loadingAnimation}
            loop
            className="w-48 h-48 sm:h-72 sm:w-72 md:h-80 md:w-80"
          />
        </div>

        <h2
          className="
            mx-auto mb-4 text-3xl sm:text-4xl md:text-[2.5rem] font-extrabold tracking-[-0.02em]
            bg-[linear-gradient(135deg,var(--color-korven-brand),var(--color-korven-accent))]
            bg-clip-text text-transparent 
          "
        >
          Korven
        </h2>

        <div className="flex justify-center mb-6">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gradient-to-r from-[var(--color-korven-brand)] to-[var(--color-korven-accent)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gradient-to-r from-[var(--color-korven-brand)] to-[var(--color-korven-accent)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gradient-to-r from-[var(--color-korven-brand)] to-[var(--color-korven-accent)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        <p className="mx-auto mb-8 text-base sm:text-lg md:text-[1.2rem] leading-relaxed text-neutral-500">
          {message}
        </p>
      </div>
    </div>
  )
}

export default LoadingScreen
