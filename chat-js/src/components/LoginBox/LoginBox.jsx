import "./LoginBox.css";
import { useState } from "react";

export default function LoginBox({ setEmail }) {
	const [emailInput, setEmailInput] = useState("");
	function handleSubmit() {
		setEmail(emailInput);
	}
	return (
		<div className="login-box">
			<input
				value={emailInput}
				onChange={(e) => setEmailInput(e.target.value)}
				placeholder="Digite seu email"
			/>
			<button type="button" onClick={handleSubmit}>
				Login
			</button>
		</div>
	);
}
