import { useState } from "react";
import "./App.css";
import UserPromptInput from "./components/UserPromptInput/UserPromptInput";
import Chat from "./components/Chat/Chat";
import getResponse from "./ai_api";
import LoginBox from "./components/LoginBox/LoginBox";

function App() {
	const [conversationStarted, setConversationStarted] = useState(false);
	const [messages, setMessages] = useState([]);
	const [isThinking, setIsThinking] = useState(false);
	const [canSendNewMessage, setCanSendNewMessage] = useState(true);
	const [email, setEmail] = useState("");

	async function submitPrompt(userPrompt) {
		setCanSendNewMessage(false);
		if (messages.length === 0) {
			setConversationStarted(true);
		}

		setMessages((prevMessages) => [
			...prevMessages,
			{ type: "user", text: userPrompt },
		]);
		setIsThinking(true);

		const aiResponse = await getResponse(userPrompt, email);

		setIsThinking(false);
		setMessages((prevMessages) => [
			...prevMessages,
			{ type: "ai", text: aiResponse },
		]);
	}

	if (email === "") {
		return <LoginBox setEmail={setEmail} />;
	}

	return (
		<>
			<Chat
				messages={messages}
				isThinking={isThinking}
				setCanSendNewMessage={setCanSendNewMessage}
			/>
			<UserPromptInput
				onSubmit={submitPrompt}
				canSubmit={canSendNewMessage}
				conversationStarted={conversationStarted}
			/>
		</>
	);
}

export default App;
