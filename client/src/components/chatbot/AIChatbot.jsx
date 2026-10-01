import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, User } from 'lucide-react';
import api from '@/utils/api';
import { useSelector } from 'react-redux';

// ============================================================
// QUICK PROJECT QUESTIONS
// ============================================================

const getSuggestions = (role) => {
  if (role === 'admin' || role === 'hod') {
    return [
      "📊 What is today's overall attendance?",
      "👨‍🏫 Which faculty took attendance today?",
      "⚠️ How many students are at risk?",
      "📉 Give me the students below 80% attendance",
      "📧 Give how many parent mail sent for below 80%"
    ];
  }
  
  if (role === 'faculty') {
    return [
      "👨‍🎓 Which students are absent today?",
      "📊 What is today's class attendance summary?",
      "📉 Which students have below 80% attendance?",
      "👨‍🎓 How many students are at risk?",
      "📅 What classes do I have today?"
    ];
  }
  
  if (role === 'student') {
    return [
      "📊 What is my current attendance percentage?",
      "📉 Which subjects have low attendance?",
      "📅 Show my timetable for today.",
      "🕒 What are my upcoming classes?",
      "💡 How can I improve my attendance percentage?"
    ];
  }
  if (role === 'parent') {
    return [
      "📊 What is my child’s current attendance percentage?",
      "📉 How many days was my child absent this month?",
      "📅 What is my child’s timetable for today?",
      "⚠️ Which subjects need more attention based on my child’s attendance?",
      "💡 What can my child do to improve their attendance?"
    ];
  }
  
  // Default fallback for others
  return [
    "📊 What is today's overall attendance?",
    "⚠️ How many students are at risk?"
  ];
};


// ============================================================
// INITIAL MESSAGE
// ============================================================

const INITIAL_MSG = {
  role: 'bot',
  text:
    "👋 Hi! I'm **SmartERP AI**, your intelligent attendance assistant.\n\n" +
    "I can answer questions about attendance, students, faculty, " +
    "classes, subjects, timetable, eligibility and predictions.\n\n" +
    "What would you like to know?",

  time: new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
};


// ============================================================
// FORMAT BOT TEXT
// ============================================================

const formatText = (text) => {

  if (!text) return '';

  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, i) => {

    if (
      part.startsWith('**') &&
      part.endsWith('**')
    ) {

      return (
        <strong key={i}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
};


// ============================================================
// MAIN COMPONENT
// ============================================================

const AIChatbot = () => {
  const { user } = useSelector((state) => state.auth);
  const currentSuggestions = getSuggestions(user?.role);

  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    INITIAL_MSG
  ]);

  const [input, setInput] = useState('');

  const [isTyping, setIsTyping] = useState(false);

  const endRef = useRef(null);

  const inputRef = useRef(null);


  // ==========================================================
  // AUTO SCROLL
  // ==========================================================

  useEffect(() => {

    endRef.current?.scrollIntoView({
      behavior: 'smooth'
    });

  }, [messages, isTyping]);


  // ==========================================================
  // FOCUS INPUT WHEN CHAT OPENS
  // ==========================================================

  useEffect(() => {

    if (isOpen) {

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

  }, [isOpen]);


  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  const handleSend = async (text) => {

    // Prevent duplicate requests
    if (isTyping) return;


    const msg =
      (text !== undefined ? text : input).trim();


    if (!msg) return;


    // ========================================================
    // USER MESSAGE
    // ========================================================

    const now =
      new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });


    setMessages(prev => [
      ...prev,

      {
        role: 'user',
        text: msg,
        time: now
      }
    ]);


    setInput('');

    setIsTyping(true);


    try {

      // ======================================================
      // SEND ONLY RECENT HISTORY
      // This keeps requests small and fast.
      // ======================================================

      const recentMessages =
        messages
          .slice(1)
          .slice(-6);


      const history =
        recentMessages.map(m => ({
          role: m.role,
          text: m.text
        }));


      // ======================================================
      // API REQUEST
      // ======================================================

      const response =
        await api.post(
          '/chat',
          {
            message: msg,
            history
          },
          {
            timeout: 60000
          }
        );


      const reply =
        response?.data?.reply ||
        response?.data?.message ||
        "I'm sorry, I couldn't generate a response.";


      // ======================================================
      // BOT MESSAGE
      // ======================================================

      setMessages(prev => [

        ...prev,

        {
          role: 'bot',
          text: reply,
          time:
            new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })
        }

      ]);


    } catch (error) {

      console.error(
        'Chatbot Error:',
        error
      );


      let errorMessage =
        '⚠️ Unable to get a response. Please try again.';


      // ------------------------------------------------------
      // SERVER ERROR MESSAGE
      // ------------------------------------------------------

      if (
        error?.response?.data?.message
      ) {

        errorMessage =
          `⚠️ ${error.response.data.message}`;

      }


      // ------------------------------------------------------
      // TIMEOUT
      // ------------------------------------------------------

      else if (
        error?.code === 'ECONNABORTED'
      ) {

        errorMessage =
          '⚠️ The response took too long. Please try again.';
      }


      // ------------------------------------------------------
      // NETWORK ERROR
      // ------------------------------------------------------

      else if (
        error?.message === 'Network Error'
      ) {

        errorMessage =
          '⚠️ Cannot connect to the chatbot server. Please check whether the backend server is running.';
      }


      setMessages(prev => [

        ...prev,

        {
          role: 'bot',
          text: errorMessage,
          time:
            new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })
        }

      ]);

    } finally {

      setIsTyping(false);

    }

  };


  // ==========================================================
  // ENTER KEY
  // ==========================================================

  const handleKeyDown = (e) => {

    if (
      e.key === 'Enter' &&
      !e.shiftKey
    ) {

      e.preventDefault();

      handleSend();
    }
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      {/* =====================================================
          FLOATING CHAT BUTTON
      ====================================================== */}

      <motion.button

        whileHover={{
          scale: 1.05
        }}

        whileTap={{
          scale: 0.95
        }}

        onClick={() =>
          setIsOpen(prev => !prev)
        }

        className="
          fixed
          bottom-6
          right-6
          z-50
          w-14
          h-14
          rounded-full
          bg-gradient-to-br
          from-indigo-600
          to-purple-600
          text-white
          shadow-2xl
          shadow-indigo-500/40
          flex
          items-center
          justify-center
          border-2
          border-white/20
        "

        aria-label="Open AI Chatbot"

      >

        <AnimatePresence mode="wait">

          {isOpen ? (

            <motion.div
              key="x"
              initial={{
                rotate: -90,
                opacity: 0
              }}
              animate={{
                rotate: 0,
                opacity: 1
              }}
              exit={{
                rotate: 90,
                opacity: 0
              }}
            >

              <X size={24} />

            </motion.div>

          ) : (

            <motion.div
              key="bot"
              initial={{
                rotate: 90,
                opacity: 0
              }}
              animate={{
                rotate: 0,
                opacity: 1
              }}
              exit={{
                rotate: -90,
                opacity: 0
              }}
            >

              <Bot size={24} />

            </motion.div>

          )}

        </AnimatePresence>


        {!isOpen && (

          <span
            className="
              absolute
              -top-1
              -right-1
              w-4
              h-4
              bg-emerald-500
              rounded-full
              border-2
              border-white
              flex
              items-center
              justify-center
            "
          >

            <Sparkles
              size={8}
              className="text-white"
            />

          </span>

        )}

      </motion.button>


      {/* =====================================================
          CHAT WINDOW
      ====================================================== */}

      <AnimatePresence>

        {isOpen && (

          <motion.div

            initial={{
              opacity: 0,
              y: 20,
              scale: 0.95
            }}

            animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }}

            exit={{
              opacity: 0,
              y: 20,
              scale: 0.95
            }}

            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30
            }}

            className="
              fixed
              bottom-24
              right-6
              z-50
              w-[360px]
              sm:w-[400px]
              h-[520px]
              flex
              flex-col
              rounded-2xl
              overflow-hidden
              border
              border-slate-200
              dark:border-slate-700
              shadow-2xl
              shadow-slate-900/20
              bg-white
              dark:bg-slate-950
            "
          >

            {/* =================================================
                HEADER
            ================================================== */}

            <div
              className="
                flex
                items-center
                gap-3
                p-4
                border-b
                border-slate-100
                dark:border-slate-800
                bg-gradient-to-r
                from-indigo-600
                to-purple-600
                text-white
              "
            >

              <div
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-white/20
                  border
                  border-white/30
                  flex
                  items-center
                  justify-center
                "
              >

                <Bot size={18} />

              </div>


              <div>

                <p className="font-bold text-sm">
                  SmartERP AI
                </p>

                <div
                  className="
                    flex
                    items-center
                    gap-1
                  "
                >

                  <span
                    className="
                      w-1.5
                      h-1.5
                      rounded-full
                      bg-emerald-400
                      animate-pulse
                    "
                  />

                  <span
                    className="
                      text-xs
                      text-indigo-200
                    "
                  >
                    Online · Smart Assistant
                  </span>

                </div>

              </div>


              <button

                onClick={() =>
                  setIsOpen(false)
                }

                className="
                  ml-auto
                  p-1
                  rounded-lg
                  hover:bg-white/20
                  transition-colors
                "
              >

                <X size={18} />

              </button>

            </div>


            {/* =================================================
                MESSAGES
            ================================================== */}

            <div
              className="
                flex-1
                overflow-y-auto
                p-4
                space-y-4
                scrollbar-hide
                bg-slate-50
                dark:bg-slate-900/50
              "
            >

              {messages.map((msg, i) => (

                <motion.div

                  key={i}

                  initial={{
                    opacity: 0,
                    y: 10
                  }}

                  animate={{
                    opacity: 1,
                    y: 0
                  }}

                  className={`
                    flex
                    gap-2.5
                    ${
                      msg.role === 'user'
                        ? 'flex-row-reverse'
                        : ''
                    }
                  `}

                >

                  {/* AVATAR */}

                  <div
                    className={`
                      w-8
                      h-8
                      rounded-full
                      flex-shrink-0
                      flex
                      items-center
                      justify-center
                      text-white
                      ${
                        msg.role === 'bot'
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                          : 'bg-slate-700'
                      }
                    `}
                  >

                    {msg.role === 'bot'
                      ? <Bot size={16} />
                      : <User size={16} />
                    }

                  </div>


                  {/* MESSAGE */}

                  <div
                    className={`
                      max-w-[78%]
                      ${
                        msg.role === 'user'
                          ? 'items-end'
                          : 'items-start'
                      }
                      flex
                      flex-col
                      gap-1
                    `}
                  >

                    <div
                      className={`
                        px-3.5
                        py-2.5
                        rounded-2xl
                        text-sm
                        leading-relaxed
                        whitespace-pre-line
                        ${
                          msg.role === 'bot'
                            ? `
                              bg-white
                              dark:bg-slate-800
                              text-slate-700
                              dark:text-slate-200
                              border
                              border-slate-200
                              dark:border-slate-700
                              rounded-tl-sm
                              shadow-sm
                            `
                            : `
                              bg-indigo-600
                              text-white
                              rounded-tr-sm
                            `
                        }
                      `}
                    >

                      {msg.role === 'bot'
                        ? formatText(msg.text)
                        : msg.text
                      }

                    </div>


                    <span
                      className="
                        text-[10px]
                        text-slate-400
                      "
                    >

                      {msg.time}

                    </span>

                  </div>

                </motion.div>

              ))}


              {/* =================================================
                  TYPING INDICATOR
              ================================================== */}

              {isTyping && (

                <motion.div

                  initial={{
                    opacity: 0
                  }}

                  animate={{
                    opacity: 1
                  }}

                  className="
                    flex
                    gap-2.5
                  "
                >

                  <div
                    className="
                      w-8
                      h-8
                      rounded-full
                      bg-gradient-to-br
                      from-indigo-500
                      to-purple-500
                      flex
                      items-center
                      justify-center
                      text-white
                    "
                  >

                    <Bot size={16} />

                  </div>


                  <div
                    className="
                      bg-white
                      dark:bg-slate-800
                      border
                      border-slate-200
                      dark:border-slate-700
                      px-4
                      py-3
                      rounded-2xl
                      rounded-tl-sm
                      shadow-sm
                    "
                  >

                    <div
                      className="
                        flex
                        gap-1.5
                        items-center
                        h-4
                      "
                    >

                      {[0, 1, 2].map(i => (

                        <motion.div

                          key={i}

                          className="
                            w-2
                            h-2
                            rounded-full
                            bg-slate-400
                          "

                          animate={{
                            y: [0, -6, 0]
                          }}

                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15
                          }}

                        />

                      ))}

                    </div>

                  </div>

                </motion.div>

              )}


              <div ref={endRef} />

            </div>


            {/* =================================================
                SUGGESTIONS
            ================================================== */}

            <div
              className="
                px-4
                py-2
                flex
                flex-wrap
                gap-2
                border-t
                border-slate-100
                dark:border-slate-800
                bg-white
                dark:bg-slate-950
              "
            >

                {currentSuggestions.map(
                  (suggestion, i) => (

                    <button

                      key={i}

                      onClick={() =>
                        handleSend(suggestion)
                      }

                      disabled={isTyping}

                      className="
                        flex-shrink-0
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        rounded-full
                        bg-indigo-50
                        dark:bg-indigo-500/10
                        text-indigo-700
                        dark:text-indigo-300
                        hover:bg-indigo-100
                        dark:hover:bg-indigo-500/20
                        disabled:opacity-40
                        transition-colors
                        border
                        border-indigo-100
                        dark:border-indigo-500/20
                      "
                    >

                      {suggestion}

                    </button>

                  )
                )}

              </div>


            {/* =================================================
                INPUT
            ================================================== */}

            <div
              className="
                p-3
                border-t
                border-slate-200
                dark:border-slate-800
                bg-white
                dark:bg-slate-950
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  bg-slate-100
                  dark:bg-slate-900
                  rounded-xl
                  px-3
                  py-2
                  border
                  border-slate-200
                  dark:border-slate-800
                  focus-within:ring-2
                  focus-within:ring-indigo-500/50
                  transition-all
                "
              >

                <input

                  ref={inputRef}

                  type="text"

                  value={input}

                  onChange={e =>
                    setInput(e.target.value)
                  }

                  onKeyDown={handleKeyDown}

                  disabled={isTyping}

                  placeholder="Ask about attendance..."

                  className="
                    flex-1
                    bg-transparent
                    text-sm
                    text-slate-700
                    dark:text-slate-200
                    outline-none
                    placeholder:text-slate-400
                    disabled:opacity-50
                  "
                />


                <button

                  onClick={() =>
                    handleSend()
                  }

                  disabled={
                    !input.trim() ||
                    isTyping
                  }

                  className="
                    w-8
                    h-8
                    rounded-lg
                    bg-indigo-600
                    hover:bg-indigo-700
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                    flex
                    items-center
                    justify-center
                    transition-colors
                  "
                >

                  <Send
                    size={14}
                    className="text-white"
                  />

                </button>

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>
    </>
  );
};


export default AIChatbot;
