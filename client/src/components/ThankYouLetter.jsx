import './ThankYouLetter.css';

export default function ThankYouLetter({ letter, fromName, toName }) {
  return (
    <div className="ty-letter glass-card">
      <div className="ty-header">
        <span className="ty-icon">💌</span>
        <div>
          <div className="ty-label">Thank You Letter</div>
          <div className="ty-from">from <strong>{fromName}</strong> to <strong>{toName}</strong></div>
        </div>
      </div>
      <pre className="ty-body">{letter}</pre>
    </div>
  );
}
