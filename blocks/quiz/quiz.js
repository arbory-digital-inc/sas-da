export default function decorate(block) {
  const rows = [...block.children];
  
  const questionData = {};
  
  rows.forEach((row) => {
    const key = row.children[0]?.textContent.trim();
    const value = row.children[1];
    
    if (key && value) {
      questionData[key] = value;
    }
  });
  
  const questionTitle = questionData['question-title']?.textContent.trim() || '';
  const question = questionData.question?.textContent.trim() || '';
  const selectionsElement = questionData['question-selections'];
  const questionNo = questionData['question-no']?.innerHTML || '';
  const questionYes = questionData['question-yes']?.innerHTML || '';
  const correctAnswer = parseInt(questionData['question-answer']?.textContent.trim(), 10) || 0;
  const nextQuestionTitle = questionData['next-question-title']?.textContent.trim() || '';
  
  const selections = [];
  if (selectionsElement) {
    const listItems = selectionsElement.querySelectorAll('li');
    listItems.forEach((li) => {
      selections.push(li.textContent.trim());
    });
  }
  
  const quizContainer = document.createElement('div');
  quizContainer.className = 'quiz-container';
  
  const header = document.createElement('div');
  header.className = 'quiz-header';
  header.textContent = questionTitle;
  
  const questionText = document.createElement('h2');
  questionText.className = 'quiz-question';
  questionText.textContent = question;
  
  const optionsGrid = document.createElement('div');
  optionsGrid.className = 'quiz-options';
  
  const feedbackContainer = document.createElement('div');
  feedbackContainer.className = 'quiz-feedback-container';
  
  selections.forEach((selection, index) => {
    const optionButton = document.createElement('button');
    optionButton.className = 'quiz-option';
    optionButton.textContent = selection;
    optionButton.setAttribute('data-answer', index + 1);
    
    optionButton.addEventListener('click', () => {
      const selectedAnswer = parseInt(optionButton.getAttribute('data-answer'), 10);
      
      quizContainer.querySelectorAll('.quiz-option').forEach((btn) => {
        btn.disabled = true;
        btn.classList.remove('selected');
      });
      
      optionButton.classList.add('selected');
      
      header.style.display = 'none';
      questionText.style.display = 'none';
      optionsGrid.style.display = 'none';
      
      feedbackContainer.innerHTML = '';
      
      const feedback = document.createElement('div');
      feedback.className = 'quiz-feedback';
      
      if (selectedAnswer === correctAnswer) {
        feedback.classList.add('correct');
        feedback.innerHTML = questionYes;
        optionButton.classList.add('correct');
      } else {
        feedback.classList.add('incorrect');
        feedback.innerHTML = questionNo;
        optionButton.classList.add('incorrect');
        
        const correctButton = quizContainer.querySelector(`[data-answer="${correctAnswer}"]`);
        if (correctButton) {
          correctButton.classList.add('correct');
        }
      }
      
      if (nextQuestionTitle) {
        const nextButton = document.createElement('button');
        nextButton.className = 'quiz-next';
        nextButton.textContent = nextQuestionTitle;
        nextButton.addEventListener('click', () => {
          const nextQuizVariant = block.className.match(/quiz\(q(\d+)\)/);
          if (nextQuizVariant) {
            const currentQ = parseInt(nextQuizVariant[1], 10);
            const nextQ = currentQ + 1;
            const nextQuizBlock = document.querySelector(`.quiz.q${nextQ}`);
            if (nextQuizBlock) {
              nextQuizBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        });
        feedback.append(nextButton);
      }
      
      feedbackContainer.append(feedback);
    });
    
    optionsGrid.append(optionButton);
  });
  
  quizContainer.append(header, questionText, optionsGrid, feedbackContainer);
  
  block.replaceChildren(quizContainer);
}
