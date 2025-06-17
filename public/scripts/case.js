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

  //   const caseNumber = '<%= caseData.caseNumber %>';
  //   const workItemNumber = '<%= workItemNumber %>';
  //   const crn = '<%= crn %>';

  const sessionId = crypto.randomUUID();

  function getContextTemplate(context) {
    let contextTemplate = "";

    switch (context) {
      case "Key info":
        contextTemplate = `get CRN:${crn},
        - Domestic violence: ? 
        - In Benefit: ? 
        - number of calls in past month: ? 
        - open Complaint service request: ? 
        - number of open service request: ? 
        - number of expired, Next action due date: ?`;
        break;

      case "Case summary":
        contextTemplate = `Summarise the case with above details for CRN:${crn}, caseNumber:${caseNumber}, srId:${workItemNumber},
        example content
        Case summary:
        Case with CRN XXXX has number of cases,
        Case XX is service type XXXXX with Weekly LIability Amount:
        Open Service request are:
        bullet point Service Request, Open date:
        if Next action due date is in the past then mention Next action due date has expired
        Closed Service request are:
        bullet point open in last 2 months
        Service Request, Open date:, Closed date:
        Recent communication are:
        bullet point open in last 2 months`;
        break;

      case "Potential actions":
        contextTemplate = `Identify Open service request for CRN:${crn}, caseNumber:${caseNumber}, srId:${workItemNumber}  for potential action and any recent communications,
        example content for Potential actions:
        Open Service request for potential actions: bullet point include open date
        Recent communication to be considered for potential actions: bullet point created in last 2 months
        Don't provide any instructions for potential actions or recommend any response for open service request.`;
        break;

      case "Open service request":
        contextTemplate = `Get Open Service request details using CRN:${crn}, caseNumber:${caseNumber}, srId:${workItemNumber}
        Example content:
        Open service request are
        - Open date:
        - SLA:
        - Link:
        - Next action due date:
        if Next action due date is in the past then mention Next action due date has expired`;
        break;

      case "Online statement":
        contextTemplate = `Get online statement using CRN:${crn}, caseNumber:${caseNumber}, srId:${workItemNumber}
        Populate Online statement in a table`;
        break;

      case "Case history":
        contextTemplate = `get Service request, communications, online statement using CRN:${crn}, caseNumber:${caseNumber}, srId:${workItemNumber}
        Example of case activities output
        {{Open date}}, {{Service Request}}, Closed date: \n
        {{Created}}, {{Type}}, Reason:, Outcome: \n
        {{Transaction date}}, {{Description}}, Balance:, Credit Amount:, Debit Amount: \n
        {{Open date}}, {{Service Request}}, Closed date: \n
        {{Transaction date}},  {{Description}}, Balance:, Credit Amount:, Debit Amount: \n
        {{Created}}, {{Type}}, Reason:, Outcome: \n`;
        break;

      default:
        return context;
    }

    console.log(contextTemplate);
    return contextTemplate;
  }

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

    $.post('/agents/history', {
      prompt: getContextTemplate(messageText),
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