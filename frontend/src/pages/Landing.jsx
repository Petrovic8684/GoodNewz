import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const sentences = [
    "       Foster a culture of positivity and kindness!       ",
    "       Exchange heartening narratives!       ",
    "       Unleash the power of encouraging stories!       ",
  ];
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const sentence = sentences[currentSentenceIndex];

    const timeout = setTimeout(() => {
      const length = currentText.length;
      const nextText = isTyping
        ? sentence.substring(0, length + 1)
        : sentence.substring(0, length - 1);

      setCurrentText(nextText);

      if (
        (isTyping && nextText === sentence) ||
        (!isTyping && nextText === "")
      ) {
        // Change state to start typing or deleting the next sentence
        setIsTyping(!isTyping);

        // If deleting is complete, move to the next sentence
        if (!isTyping && currentSentenceIndex + 1 < sentences.length) {
          setCurrentSentenceIndex(currentSentenceIndex + 1);
          // Add a delay of 1 second after completely typing a sentence
        } else if (!isTyping) {
          // If all sentences are processed, reset to the first sentence
          setCurrentSentenceIndex(0);
        }
      }
    }, 100); // Adjust the typing speed as needed

    return () => clearTimeout(timeout);
  }, [currentText, isTyping, currentSentenceIndex]);

  return (
    <section className="h-[95vh] flex items-center">
      <div className="px-12 mx-auto max-w-7xl">
        <div className="w-full mx-auto text-left md:w-11/12 xl:w-9/12 md:text-center">
          <h1 className="mb-4 text-[40px] sm:text-[60px] md:text-[80px] font-extrabold leading-none tracking-normal text-slate-800 dark:text-white md:tracking-tight">
            GoodNewz
          </h1>
          <p className="mb-12 text-lg text-slate-600 dark:text-slate-400 md:text-xl lg:px-24">
            Connect with friends, share uplifting stories, and spread joy in our
            vibrant and supportive community. Experience a chat app designed to
            brighten your day. Join us in spreading good vibes!
          </p>
          <div className="flex items-center">
            <input
              type="text"
              value={currentText}
              className="hidden sm:block basis-2/3 bg-white dark:bg-slate-800 py-4 px-6 text-base md:text-lg text-slate-900 dark:text-slate-400 rounded-l-full border-2 border-slate-300 dark:border-slate-600 border-r-0 focus:outline-none focus:border-blue-500 "
              readOnly
            />
            <Link
              to={"/login"}
              className="basis-full xsm:basis-1/2 sm:basis-1/3 text-center py-[18px] bg-blue-500 text-white text-base md:text-xl rounded-l-full sm:rounded-l-none rounded-r-full focus:outline-none hover:bg-blue-600 sm:transition-all sm:duration-300"
            >
              Get Started!
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
