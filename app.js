const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { invokeBedrockAgentKB, invokeBedrockAgentHistory } = require("./src/services/generate-answer");
const app = express();
// const { fetchSimilarAct, fetchSimilarAppeal } = require('./src/services/fetch-similar');
// const { generateAnswer, generateSummary, generateDecision, generateInsights } = require('./src/services/generate-answers');
// const connectRedis = require('./src/config/redis');
// const {flushCache} = require('./src/utils/manage-cache');

// Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// serve static files from the public directory
app.use(express.static("public"));

// Define a route

app.get("/health", (req, res) => {
  res.status(200).json({
    code: 200,
    message: "Healthy",
  });
});

// app.get('/utils/flush/cache', async(req, res) => {
//   await flushCache();
//   res.status(200).json({
//     code: 200,
//     message: "Healthy"
//   });
// })

// app.post('/case/act/results', async (req, res) => {
//   console.log(req.body);
//   const results = await fetchSimilarAct(req.body.query);
//   res.render('case-act-results', {
//     results: results
//   });
// });

// app.post('/history/response', async (req, res) => {
//   console.log(req.body);
//   const keys = [];
//   keys.push(req.body.key);
//   const answer = await generateAnswer(keys, req.body.query);
//   res.render('history-response', {
//     key: req.body.key,
//     query: req.body.query,
//     answer: answer
//   });
// });

// app.post('/history/home', async (req, res) => {
//   console.log(req.body);
//   const summary = await generateSummary(req.body.key);
//   const decision = await generateDecision(req.body.key);
//   res.render('history-home', {
//     key: req.body.key,
//     summary: summary,
//     decision: decision
//   });
// })

// app.post('/case/home', async (req, res) => {
//   console.log(req.body);
//   console.log(req.body.firstName);
//   const query = `Claim: ${req.body.claim}\nEvidences: ${req.body.evidences}`;
//   const similarAppeals = await fetchSimilarAppeal(query);
//   console.log(similarAppeals);
//   const keys = [];
//   let successCount = 0;
//   for(const item of similarAppeals) {
//     item['summary'] = await generateSummary(item.key);
//     item['decision'] = await generateDecision(item.key);
//     keys.push(item.key);

//     if(item['decision'].toLowerCase().includes('allow')) {
//       console.log("found allow");
//       successCount = successCount + 1;
//     }
//     else if(item['decision'].toLowerCase().includes('dismiss')) {
//       console.log("found dismiss");
//       // do nothing
//     }
//     else {
//       console.log("found none");
//       successCount = successCount + 0.5;
//     }
//   }

//   let insights = "No insights!";
//   let stats = 0;

//   if(similarAppeals.length > 0) {
//    insights = await generateInsights(keys);
//    stats = successCount/similarAppeals.length;
//    stats = stats * 100;
//    stats = Math.round(stats);
//   }
//   console.log(similarAppeals);
//   res.render('case-home', {
//     input: req.body,
//     appeals: similarAppeals,
//     insights: insights,
//     stats: stats
//   });
// })

// app.post('/form', (req, res) => {
//     res.render('form')
// })

app.post("/agents/procedures", async (req, res) => {
  if (!req.body.prompt || !req.body.sessionId) {
    return res.status(400).json({
      code: 400,
      message: "Invalid input"
    });
  }

  let response;

  try {
    response = await invokeBedrockAgentKB(req.body.prompt, req.body.sessionId);
  }
  catch (err) {
    return res.status(500).json({
      code: 500,
      message: err.message
    });
  }

  return res.status(200).json({
    data: {
      response: response.completion
    }
  })
})

app.post("/agents/history", async (req, res) => {
  if (!req.body.prompt || !req.body.sessionId) {
    return res.status(400).json({
      code: 400,
      message: "Invalid input"
    });
  }

  let response;

  try {
    response = await invokeBedrockAgentHistory(req.body.prompt, req.body.sessionId);
  }
  catch (err) {
    return res.status(500).json({
      code: 500,
      message: err.message
    });
  }

  return res.status(200).json({
    data: {
      response: response.completion
    }
  })
})

app.get("/work-items", async (req, res) => {
  //   await connectRedis();


  const workItemData = {
    subArea: "Change income",
    ...req.query
  }
  const moreInfo = {};

  const workItemsPath = path.join(__dirname, "src", "model", "work-items.json");
  const workItems = JSON.parse(fs.readFileSync(workItemsPath));

  if (workItems[workItemData.subArea]) {
    moreInfo['quickHelp'] = workItems[workItemData.subArea]
  }

  res.render("work-item", {
    workItemData,
    moreInfo
  });
});

app.get("/cases", async (req, res) => {
  //   await connectRedis();
  const caseData = {
    ...req.query
  }
  // console.log(Object.keys(req.query));
  res.render("case", {
    caseData
  });
});


app.get("/", (req, res) => {
  res.redirect("/work-items");
});

// start the server
app.listen(8000, () => {
  console.log("Server listening on port 3000");
});
