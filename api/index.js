const express = require("express");
const app = express();
const PORT = 8080;
app.use(express.json());
app.listen(PORT, () => console.log("it works on" + PORT));

let links = [
  "https://youtube.com",
  "https://google.com",
  "https://stackoverflow.com",
];

app.get("/url", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  res.status(200).send({
    URLs: { links },
  });
});

app.post("/url", (req, res) => {
  const ll = req.body.url;

  if (!ll) res.status(418).send("NO URL PROVIDED");

  links.push(ll);

  res.status(200).send("ADDED");
});
