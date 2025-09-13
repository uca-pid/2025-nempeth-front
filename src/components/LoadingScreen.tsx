import Lottie from 'lottie-react'
import loadingAnimation from '../assets/Load HIVE.json'
import '../Styles/LoadingScreen.css'

interface LoadingScreenProps {
  message?: string
}

function LoadingScreen({ message = "Cargando datos..." }: LoadingScreenProps) {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-animation">
          <Lottie
            animationData={loadingAnimation}
            loop={true}
            style={{ width: 200, height: 200 }}
          />
        </div>
        <h2 className="loading-title">Korven</h2>
        <p className="loading-message">{message}</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
