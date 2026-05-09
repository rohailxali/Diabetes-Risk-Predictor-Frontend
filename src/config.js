// Central API configuration
// In production (Netlify), set VITE_API_URL in the Netlify environment variables UI.
// Falls back to the HuggingFace Space backend if env var is not set.
const config = {
  API_URL: import.meta.env.VITE_API_URL || 'https://rohailxali-diabetes-risk-predictor.hf.space'
}

export default config
