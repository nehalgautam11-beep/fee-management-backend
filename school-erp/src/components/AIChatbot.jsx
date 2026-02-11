import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hi! I'm NOVA, your intelligent ERP companion. Ready to assist you with anything!" }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const [extraFeeStats, setExtraFeeStats] = useState({
    extraCollected: 0,
    extraPending: 0
  })

  useEffect(() => {
    fetchExtraFeeStats()
  }, [])

  const fetchExtraFeeStats = async () => {
    try {
      const res = await fetch("/api/extra-fees/summary", {
        credentials: "include"
      })
      const data = await res.json()

      setExtraFeeStats({
        extraCollected: data.collected || 0,
        extraPending: data.pending || 0
      })
    } catch (err) {
      console.error("Extra fee stats error", err)
    }
  }

  const responses = {
    "fees": "Access fee management through Students → Select Class → View Details. You can process payments, generate receipts, and track installments.",
    "extra fee": `💰 Extra Fees Summary

Collected: ₹${extraFeeStats.extraCollected.toLocaleString("en-IN")}
Pending: ₹${extraFeeStats.extraPending.toLocaleString("en-IN")}`,
    "extra fees": `💰 Extra Fees Summary

Collected: ₹${extraFeeStats.extraCollected.toLocaleString("en-IN")}
Pending: ₹${extraFeeStats.extraPending.toLocaleString("en-IN")}`,
    "reports": "Head to Reports section for comprehensive analytics: collections, class-wise breakdowns, and defaulter tracking.",
    "students": "Students page is your control center: Add, Edit, Promote, or Remove students with full data management.",
    "add_student": "Quick add: Students → Add Student button → Fill Name, Phone, Class, Total Fee → Confirm.",
    "edit_student": "Open student details → Edit button → Modify Name, Class, or Phone (Fee locked for security).",
    "delete_student": "From student details panel → Delete → Confirm. This action is irreversible.",
    "installments": "Installment tracking is automatic. Each payment creates a timestamped record in payment history.",
    "dashboard": "Your command center: Real-time stats on students, collections, pending amounts, and trends.",
    "extra_payment": "Extra Fees section → Select fee → Mark students as Paid → Receipt auto-generates.",
    "receipts": "All receipts are auto-generated as PDFs, uploaded to cloud, and expire in 24 hours for security.",
    "promotion": "Promote students individually or entire classes at once using the Promote function.",
    "academic_year": "Start Next Academic Year from Dashboard: Resets stats, promotes all students, and sets new fee structure.",
    "excel_import": "Students page → Import button → Upload Excel/CSV with columns: Name, Phone, Class, Total Fee.",
    "excel_export": "Select a class → Export button → Downloads Excel file with student data.",
    "defaulters": "Reports → Defaulters section shows top 5 students with highest pending amounts.",
    "security": "Bank-grade security: JWT authentication, encrypted connections, and auto-logout on inactivity.",
    "logout": "Sidebar → Logout button → Confirmation → Session terminated securely.",
    "help": "I'm NOVA, trained on your entire ERP system. Ask me about students, fees, reports, Excel operations, or anything else!"
  }

  const handleSend = () => {
    if (!input.trim()) return

    setMessages([...messages, { type: "user", text: input }])
    setIsTyping(true)
    
    setTimeout(() => {
      const response = Object.keys(responses).find(key => input.toLowerCase().includes(key))
      const reply = response ? responses[response] : "I'm here to help! Try asking about: fees, students, reports, extra fees, Excel import/export, or academic year management."
      
      setMessages(prev => [...prev, { type: "bot", text: reply }])
      setIsTyping(false)
    }, 800)

    
    
    setInput("")
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        className="chatbot-fab-container"
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          zIndex: 1000
        }}
      >
        {/* Outer Glow Ring */}
        <motion.div
          style={{
            position: "absolute",
            inset: "-12px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent 70%)",
            filter: "blur(20px)"
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Rotating Ring */}
        <motion.div
          style={{
            position: "absolute",
            inset: "-8px",
            borderRadius: "50%",
            border: "2px solid transparent",
            borderTopColor: "#6366f1",
            borderRightColor: "#8b5cf6"
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Main Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: "relative",
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
            border: "none",
            color: "white",
            fontSize: "32px",
            cursor: "pointer",
            boxShadow: `
              0 10px 40px rgba(99, 102, 241, 0.5),
              0 0 0 1px rgba(255, 255, 255, 0.1) inset,
              0 2px 4px rgba(255, 255, 255, 0.2) inset
            `,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}
          whileHover={{ 
            scale: 1.1,
            boxShadow: `
              0 15px 60px rgba(99, 102, 241, 0.7),
              0 0 0 1px rgba(255, 255, 255, 0.15) inset,
              0 2px 4px rgba(255, 255, 255, 0.3) inset
            `
          }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Shimmer Effect */}
          <motion.div
            style={{
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)"
            }}
            animate={{
              rotate: [0, 360]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          <motion.span
            style={{ position: "relative", zIndex: 1 }}
            animate={isOpen ? {} : { 
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            {isOpen ? "✕" : "🤖"}
          </motion.span>
        </motion.button>
        
        {/* Particle Effects around button */}
        {!isOpen && [0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 0 10px rgba(99, 102, 241, 0.8)"
            }}
            animate={{
              x: [0, Math.cos(i * Math.PI / 2) * 50],
              y: [0, Math.sin(i * Math.PI / 2) * 50],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut"
            }}
          />
        ))}
      </motion.div>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-window"
            style={{
              position: "fixed",
              bottom: "130px",
              right: "32px",
              width: "440px",
              height: "680px",
              zIndex: 999,
              display: "flex",
              flexDirection: "column"
            }}
            initial={{ opacity: 0, y: 40, scale: 0.85, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 40, scale: 0.85, rotateX: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Background with Glassmorphism */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: `
                linear-gradient(135deg, 
                  rgba(15, 23, 42, 0.97) 0%,
                  rgba(30, 41, 59, 0.95) 50%,
                  rgba(15, 23, 42, 0.97) 100%
                )
              `,
              backdropFilter: "blur(40px) saturate(180%)",
              borderRadius: "28px",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              boxShadow: `
                0 30px 90px rgba(0, 0, 0, 0.6),
                0 0 0 1px rgba(255, 255, 255, 0.05) inset,
                0 0 100px rgba(99, 102, 241, 0.15)
              `
            }} />
            
            {/* Animated Background Orbs */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "28px" }}>
              <motion.div
                style={{
                  position: "absolute",
                  top: "10%",
                  left: "10%",
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)",
                  filter: "blur(40px)"
                }}
                animate={{
                  x: [0, 50, 0],
                  y: [0, 30, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                style={{
                  position: "absolute",
                  bottom: "10%",
                  right: "10%",
                  width: "250px",
                  height: "250px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(139, 92, 246, 0.12), transparent 70%)",
                  filter: "blur(50px)"
                }}
                animate={{
                  x: [0, -40, 0],
                  y: [0, -50, 0],
                  scale: [1, 1.3, 1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
            </div>

            {/* Content Container */}
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
              
              {/* Header */}
              <div style={{
                padding: "24px",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))",
                borderBottom: "1px solid rgba(99, 102, 241, 0.2)",
                position: "relative",
                overflow: "hidden",
                borderRadius: "28px 28px 0 0"
              }}>
                {/* Animated Scan Line */}
                <motion.div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "2px",
                    background: "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.8), transparent)"
                  }}
                  animate={{ left: ["100%", "-100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                
                <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "16px" }}>
                  {/* Avatar with Pulse */}
                  <div style={{ position: "relative" }}>
                    <motion.div
                      style={{
                        position: "absolute",
                        inset: "-4px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        opacity: 0.3
                      }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                        boxShadow: `
                          0 8px 24px rgba(99, 102, 241, 0.4),
                          0 0 0 2px rgba(255, 255, 255, 0.1) inset
                        `,
                        position: "relative"
                      }}
                      animate={{ 
                        boxShadow: [
                          "0 8px 24px rgba(99, 102, 241, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.1) inset",
                          "0 8px 32px rgba(139, 92, 246, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.15) inset",
                          "0 8px 24px rgba(99, 102, 241, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.1) inset"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      🤖
                    </motion.div>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <motion.h3 
                      style={{ 
                        margin: 0, 
                        fontSize: "22px", 
                        fontWeight: "700", 
                        background: "linear-gradient(135deg, #fff 0%, #e0e7ff 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        letterSpacing: "0.5px"
                      }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      NOVA AI
                    </motion.h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <motion.div
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: "#10b981",
                          boxShadow: "0 0 10px rgba(16, 185, 129, 0.6)"
                        }}
                        animate={{ 
                          boxShadow: [
                            "0 0 10px rgba(16, 185, 129, 0.6)",
                            "0 0 20px rgba(16, 185, 129, 0.9)",
                            "0 0 10px rgba(16, 185, 129, 0.6)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "500" }}>
                        Online & Ready
                      </span>
                      {/* AI Badge */}
                      <div style={{
                        padding: "2px 8px",
                        background: "rgba(99, 102, 241, 0.2)",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        borderRadius: "6px",
                        fontSize: "10px",
                        color: "#a5b4fc",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        AI-Powered
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Messages Area */}
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                position: "relative"
              }}>
                {/* Grid Pattern Overlay */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `
                    linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                  pointerEvents: "none"
                }} />
                
                <div style={{ position: "relative", zIndex: 1 }}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      style={{
                        marginBottom: "20px",
                        display: "flex",
                        justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
                        gap: "12px"
                      }}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: i * 0.05,
                        type: "spring",
                        damping: 20,
                        stiffness: 300
                      }}
                    >
                      {msg.type === "bot" && (
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          flexShrink: 0,
                          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                        }}>
                          🤖
                        </div>
                      )}
                      
                      <div style={{
                        position: "relative",
                        maxWidth: "75%"
                      }}>
                        {/* Message Bubble */}
                        <motion.div
                          style={{
                            padding: "14px 18px",
                            borderRadius: msg.type === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                            background: msg.type === "user"
                              ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                              : "rgba(30, 41, 59, 0.6)",
                            backdropFilter: "blur(10px)",
                            color: "#fff",
                            fontSize: "14.5px",
                            lineHeight: "1.6",
                            boxShadow: msg.type === "user"
                              ? `
                                  0 8px 24px rgba(99, 102, 241, 0.35),
                                  0 0 0 1px rgba(255, 255, 255, 0.1) inset
                                `
                              : `
                                  0 4px 16px rgba(0, 0, 0, 0.2),
                                  0 0 0 1px rgba(99, 102, 241, 0.15)
                                `,
                            border: msg.type === "bot" ? "1px solid rgba(99, 102, 241, 0.2)" : "none",
                            position: "relative",
                            overflow: "hidden",
                            whiteSpace: "pre-line"
                          }}
                          whileHover={{
                            scale: 1.02,
                            boxShadow: msg.type === "user"
                              ? "0 12px 32px rgba(99, 102, 241, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.15) inset"
                              : "0 6px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.25)"
                          }}
                        >
                          {msg.text}
                          
                          {/* Shimmer for user messages */}
                          {msg.type === "user" && (
                            <motion.div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: "-100%",
                                width: "100%",
                                height: "100%",
                                background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)"
                              }}
                              animate={{ left: ["100%", "-100%"] }}
                              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                            />
                          )}
                        </motion.div>
                        
                        {/* Timestamp */}
                        <div style={{
                          fontSize: "11px",
                          color: "#64748b",
                          marginTop: "6px",
                          textAlign: msg.type === "user" ? "right" : "left",
                          paddingLeft: msg.type === "user" ? "0" : "8px",
                          paddingRight: msg.type === "user" ? "8px" : "0"
                        }}>
                          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center"
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        flexShrink: 0
                      }}>
                        🤖
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          padding: "16px 20px",
                          background: "rgba(30, 41, 59, 0.6)",
                          backdropFilter: "blur(10px)",
                          borderRadius: "20px 20px 20px 4px",
                          border: "1px solid rgba(99, 102, 241, 0.2)",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
                        }}
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                              boxShadow: "0 0 10px rgba(99, 102, 241, 0.5)"
                            }}
                            animate={{ 
                              y: [0, -12, 0],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.15,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Input Area */}
              <div style={{
                padding: "20px 24px 24px 24px",
                background: "rgba(15, 23, 42, 0.5)",
                backdropFilter: "blur(20px)",
                borderTop: "1px solid rgba(99, 102, 241, 0.2)",
                borderRadius: "0 0 28px 28px"
              }}>
                <div style={{ 
                  display: "flex", 
                  gap: "12px",
                  position: "relative"
                }}>
                  {/* Input Glow Effect */}
                  <div style={{
                    position: "absolute",
                    inset: "-2px",
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))",
                    borderRadius: "16px",
                    filter: "blur(8px)",
                    opacity: 0,
                    transition: "opacity 0.3s"
                  }} id="input-glow" />
                  
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    style={{
                      flex: 1,
                      padding: "14px 20px",
                      background: "rgba(30, 41, 59, 0.6)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(99, 102, 241, 0.25)",
                      borderRadius: "14px",
                      color: "#fff",
                      fontSize: "14.5px",
                      outline: "none",
                      transition: "all 0.3s ease",
                      position: "relative",
                      zIndex: 1,
                      fontFamily: "inherit"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1"
                      e.target.style.background = "rgba(30, 41, 59, 0.8)"
                      e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1), 0 4px 16px rgba(99, 102, 241, 0.2)"
                      document.getElementById('input-glow').style.opacity = "1"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(99, 102, 241, 0.25)"
                      e.target.style.background = "rgba(30, 41, 59, 0.6)"
                      e.target.style.boxShadow = "none"
                      document.getElementById('input-glow').style.opacity = "0"
                    }}
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    style={{
                      padding: "14px 28px",
                      background: input.trim() 
                        ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                        : "rgba(71, 85, 105, 0.5)",
                      border: "none",
                      borderRadius: "14px",
                      color: "white",
                      cursor: input.trim() ? "pointer" : "not-allowed",
                      fontWeight: "600",
                      fontSize: "14.5px",
                      boxShadow: input.trim()
                        ? "0 8px 24px rgba(99, 102, 241, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1) inset"
                        : "none",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden"
                    }}
                    whileHover={input.trim() ? {
                      scale: 1.05,
                      boxShadow: "0 12px 32px rgba(99, 102, 241, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15) inset"
                    } : {}}
                    whileTap={input.trim() ? { scale: 0.95 } : {}}
                  >
                    <span style={{ position: "relative", zIndex: 1 }}>Send</span>
                    {input.trim() && (
                      <motion.div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)"
                        }}
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
                    )}
                  </motion.button>
                </div>
                
                {/* Quick Actions */}
                <div style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "12px",
                  flexWrap: "wrap"
                }}>
                  {["Fees", "Students", "Reports"].map((action, i) => (
                    <motion.button
                      key={action}
                      onClick={() => setInput(action.toLowerCase())}
                      style={{
                        padding: "6px 12px",
                        background: "rgba(99, 102, 241, 0.1)",
                        border: "1px solid rgba(99, 102, 241, 0.2)",
                        borderRadius: "8px",
                        color: "#a5b4fc",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: "500",
                        transition: "all 0.2s"
                      }}
                      whileHover={{
                        background: "rgba(99, 102, 241, 0.2)",
                        scale: 1.05
                      }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      {action}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Corner Accent Lines */}
            {[
              { top: 0, left: 0, rotate: 0 },
              { top: 0, right: 0, rotate: 90 },
              { bottom: 0, left: 0, rotate: -90 },
              { bottom: 0, right: 0, rotate: 180 }
            ].map((pos, i) => (
              <motion.div
                key={i}
                style={{
                  position: "absolute",
                  ...pos,
                  width: "60px",
                  height: "60px",
                  borderTop: "3px solid rgba(99, 102, 241, 0.3)",
                  borderLeft: "3px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: "28px",
                  transform: `rotate(${pos.rotate}deg)`,
                  pointerEvents: "none"
                }}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .chatbot-window::-webkit-scrollbar {
          width: 6px;
        }
        .chatbot-window::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.3);
          border-radius: 10px;
        }
        .chatbot-window::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1, #8b5cf6);
          border-radius: 10px;
        }
        .chatbot-window::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #8b5cf6, #a855f7);
        }
      `}</style>
    </>
  )
}