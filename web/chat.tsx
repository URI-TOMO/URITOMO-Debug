// @ts-nocheck
// React runtime is provided globally via UMD in index.html
/* global React, ReactDOM */
const { useState, useEffect, useRef } = React;

// ✅ 기본 테스트 URL (필요 시 변경)
const WS_URL_DEFAULT = "ws://----------/meeting/{session_id}?token={access_token}";

function ChatDebugComponent() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [wsUrl, setWsUrl] = useState(WS_URL_DEFAULT);
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        return () => {
            if (ws.current) ws.current.close();
        };
    }, []);

    const connect = () => {
        if (!wsUrl.startsWith("ws://") && !wsUrl.startsWith("wss://")) {
            alert("URLを確認してください (ws:// または wss://)");
            return;
        }
        if (ws.current && ws.current.readyState === WebSocket.OPEN) return;

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            setIsConnected(true);
            pushMessage({ kind: "system", payload: "connected" });
        };

        ws.current.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data);
                pushMessage({ kind: "json", payload: parsed });
            } catch {
                pushMessage({ kind: "text", payload: event.data });
            }
        };

        ws.current.onerror = () => {
            pushMessage({ kind: "system", payload: "error" });
        };

        ws.current.onclose = () => {
            setIsConnected(false);
            pushMessage({ kind: "system", payload: "disconnected" });
        };
    };

    const disconnect = () => {
        if (ws.current) ws.current.close();
    };

    const pushMessage = (msg) => {
        setMessages((prev) => [...prev, msg]);
    };

    const sendMessage = () => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
            alert("接続されていません");
            return;
        }
        if (!input.trim()) return;

        const payload = {
            type: "chat",
            text: input,
            lang: "ja"
        };

        ws.current.send(JSON.stringify(payload));
        setInput("");
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h3 style={styles.title}>URITOMO Debug Chat</h3>
                <span style={{
                    ...styles.status,
                    backgroundColor: isConnected ? '#48bb78' : '#f56565'
                }}>
                    {isConnected ? "Connected" : "Disconnected"}
                </span>
            </header>

            <div style={styles.controls}>
                <input
                    style={styles.urlInput}
                    value={wsUrl}
                    onChange={(e) => setWsUrl(e.target.value)}
                    placeholder="ws://..."
                />
                <div style={styles.controlRow}>
                    <button style={styles.button} onClick={connect}>接続</button>
                    <button style={styles.buttonGhost} onClick={disconnect}>切断</button>
                </div>
            </div>

            <div style={styles.messageList}>
                {messages.length === 0 && (
                    <div style={styles.emptyState}>No messages yet.</div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} style={styles.messageItem}>
                        <div style={styles.sender}>
                            {msg.kind}
                        </div>
                        <pre style={styles.bubble}>
                            {typeof msg.payload === 'string'
                                ? msg.payload
                                : JSON.stringify(msg.payload, null, 2)}
                        </pre>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputArea}>
                <input
                    style={styles.input}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    disabled={!isConnected}
                />
                <button
                    style={{
                        ...styles.button,
                        backgroundColor: isConnected ? '#3182ce' : '#cbd5e0',
                        cursor: isConnected ? 'pointer' : 'not-allowed'
                    }}
                    onClick={sendMessage}
                    disabled={!isConnected}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '720px',
        margin: '30px auto',
        border: '1px solid #2b3350',
        borderRadius: '12px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
        backgroundColor: '#121629',
        display: 'flex',
        flexDirection: 'column',
        height: '680px',
    },
    header: {
        padding: '16px',
        borderBottom: '1px solid #2b3350',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#151a2d',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
    },
    title: {
        margin: 0,
        fontSize: '16px',
    },
    status: {
        padding: '4px 8px',
        borderRadius: '999px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    controls: {
        padding: '12px 16px',
        borderBottom: '1px solid #2b3350',
        backgroundColor: '#101425',
    },
    urlInput: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '10px',
        border: '1px solid #2b3350',
        backgroundColor: '#0f1220',
        color: '#e9edf5',
        outline: 'none',
        fontSize: '13px',
    },
    controlRow: {
        display: 'flex',
        gap: '8px',
        marginTop: '10px',
    },
    messageList: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        backgroundColor: '#0f1220',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    emptyState: {
        textAlign: 'center',
        color: '#6c738a',
        marginTop: '50px',
    },
    messageItem: {
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'stretch',
        maxWidth: '100%',
    },
    sender: {
        fontSize: '12px',
        color: '#9aa3b2',
        marginBottom: '6px',
        marginLeft: '2px',
    },
    bubble: {
        padding: '10px 12px',
        backgroundColor: '#151a2d',
        borderRadius: '8px',
        border: '1px solid #2b3350',
        lineHeight: '1.4',
        color: '#dbe2f0',
        whiteSpace: 'pre-wrap',
        fontSize: '13px',
        margin: 0,
    },
    inputArea: {
        padding: '16px',
        borderTop: '1px solid #2b3350',
        display: 'flex',
        gap: '10px',
        backgroundColor: '#101425',
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px',
    },
    input: {
        flex: 1,
        padding: '10px 14px',
        borderRadius: '20px',
        border: '1px solid #2b3350',
        outline: 'none',
        fontSize: '14px',
        backgroundColor: '#0f1220',
        color: '#e9edf5',
    },
    button: {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '20px',
        color: 'white',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
        backgroundColor: '#3182ce',
        cursor: 'pointer',
    },
    buttonGhost: {
        padding: '8px 16px',
        border: '1px solid #2b3350',
        borderRadius: '20px',
        color: '#e9edf5',
        backgroundColor: '#0f1220',
        cursor: 'pointer',
    }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(ChatDebugComponent));
