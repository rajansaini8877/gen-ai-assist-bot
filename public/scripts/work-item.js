// Function to get current time formatted as HH:MM AM/PM
function getCurrentTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'
  const minutesFormatted = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutesFormatted} ${ampm}`;
}

$(document).ready(function () {
  const chatMessages = $('#chat-messages');
  const chatInput = $('#chat-input');
  const sendButton = $('#send-button');
  const predefinedQuestions = $('.predefined-q'); // Select all predefined question links

  $('.timestamp').text(getCurrentTime());

  const sessionId = crypto.randomUUID();

  function sendMessage(messageText) {
    // If messageText is not provided, get it from the input field

    if (messageText === undefined) {
      messageText = chatInput.val().trim();
    }

    if (messageText === "") {
      return;
    }

    const userTimestamp = getCurrentTime();

    // Append user message
    chatMessages.append(`
                    <div class="message user">
                        <div class="content">
                            ${messageText}
                            <span class="timestamp">${userTimestamp}</span>
                        </div>
                        <div class="ui circular image avatar">
                            <img src="/assets/user.png">
                        </div>
                    </div>
                `);

    // Add bot typing indicator
    const typingIndicator = $(`
                    <div class="message bot typing" id="typing-indicator">
                        <div class="ui circular image avatar">
                            <img src="/assets/bot.png">
                        </div>
                        <div class="content">
                            <span class="jumping-dots">
                              <span class="dot-1">
                                <i class="tiny circle icon"></i>
                              </span>
                              <span class="dot-2">
                                <i class="tiny circle icon"></i>
                              </span>
                              <span class="dot-3">
                                <i class="tiny circle icon"></i>
                              </span>
                            </span>
                        </div>
                    </div>
                `);
    chatMessages.append(typingIndicator);
    chatMessages.scrollTop(chatMessages[0].scrollHeight); // Scroll to bottom to show typing

    // Simulate bot response (replace with actual backend integration)
    // In a real application, you'd send `messageText` to your backend here.

    $.post('/agents/procedures', {
      prompt: messageText,
      sessionId
    }, (data) => {

      const responseHTML = marked.parse(data.data.response);

      $('#typing-indicator').remove();

      const botTimestamp = getCurrentTime();

      chatMessages.append(`
                        <div class="message bot">
                            <div class="ui circular image avatar">
                                <img src="/assets/bot.png">
                            </div>
                            <div class="content">
                                ${responseHTML}
                                <a href='https://changetoincomevideo.s3.eu-west-2.amazonaws.com/UX-CoC-Income-1080p.mp4' target='_blank'>Need more information? Click here for video</>
                                <span class="timestamp">${botTimestamp}</span>
                            </div>
                        </div>
                    `);
      chatMessages.scrollTop(chatMessages[0].scrollHeight); // Scroll to bottom
    });

    chatInput.val(''); // Clear input
    chatMessages.scrollTop(chatMessages[0].scrollHeight); // Scroll to bottom
  }

  // Event listener for Send button
  sendButton.on('click', function () {
    sendMessage();
  });

  // Event listener for Enter key in input field
  chatInput.on('keypress', function (e) {
    if (e.which === 13 && !e.shiftKey) { // Enter key pressed, but not Shift + Enter
      e.preventDefault(); // Prevent new line in textarea
      sendMessage();
    }
  });

  // Event listener for predefined questions
  predefinedQuestions.on('click', function (e) {
    e.preventDefault(); // Prevent the default link behavior
    const question = $(this).data('question'); // Get the question from data-question attribute
    sendMessage(question); // Send the predefined question as a message
  });
});