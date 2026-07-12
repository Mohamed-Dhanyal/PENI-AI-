import '../styles/peni-button.css'

export default function PeniButton({ onClick, active }) {
  return (
    <button className={`peni-btn ${active ? 'is-active' : ''}`} type="button" onClick={onClick}>
      <span className="peni-btn-label">
        <span className="peni-p">P</span>eni
      </span>
    </button>
  )
}
