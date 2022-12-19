const express = require("express");
const mongoose = require("mongoose");
const Admin = require("./Model/Admin");
const Story = require("./Model/Story");
const jwt = require("jsonwebToken");
const app = express();

const bcrypt = require("bcryptjs");
app.use(express.json());

const port = process.env.PORT || 3000;

const secretKey = "Apple";

//  mongodb+srv://mumraiz:<mumraiz1021>@cluster0.k3cfou0.mongodb.net/?retryWrites=true&w=majority
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017");

app.post("/api/admin/register", async (req, res) => {
  if (req.body?.userName && req.body?.password) {
    const salt = await bcrypt.genSalt(10);
    const secPassword = await bcrypt.hash(req.body.password, salt);

    try {
      const findAdmin = await Admin.findOne({
        userName: req.body.userName,
      });

      if (!findAdmin) {
        await Admin.create({
          userName: req.body.userName,
          password: secPassword,
        });
        console.log("userRegistered");
        res.status(200);
        res.send("success");
      } else {
        res.status(302);
        console.log("User Already exist");
        res.send("User Already exist");
      }
    } catch {
      res.status(400);
      res.send("failed");
    }
  } else {
    res.status(400);
    res.send("failed");
  }
});
app.post("/", async (req, res) => {
  res.status(200);
  res.send({ hello: "hello" });
});
app.post("/api/admin/LogIn", async (req, res) => {
  if (req.body) {
    try {
      const findAdmin = await Admin.findOne({
        userName: req.body.userName,
      });
      const verified = await bcrypt.compareSync(
        req.body.password,
        findAdmin.password
      );

      if (verified) {
        const user = req.body.userName;
        jwt.sign({ user }, secretKey, { expiresIn: "300s" }, (err, token) => {
          if (err) {
          } else {
            res.status(200);
            res.send({ sucess: "success", token: token });
          }
        });
      } else {
        res.status(401);
        console.log("User Does Not exist");
        res.send("User Does Not exist");
      }
    } catch {
      res.status(401);
      res.send("failed");
    }
  }
});
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    req.token = token;
    next();
  } else {
    res.status(401);
    res.send({ message: "failed" });
  }
};
app.post("/api/profile", verifyToken, async (req, res) => {
  jwt.verify(req.token, secretKey, (err, authData) => {
    if (err) {
      res.status(401);
      res.send({ message: "invalid Token" });
    } else {
      res.status(200);
      res.send({ message: "Authorized", authData });
    }
  });
});

const Idgenerator = async () => {
  const randomNumber = Math.floor(Math.random() * 100000);

  try {
    const findId = await Story.findOne({
      Storyid: randomNumber,
    });
    // console.log(findId);
    if (findId) {
      Idgenerator();
    } else {
      return randomNumber;
    }
  } catch {
    console.log("Random no Generation Failed");
  }
};
app.post("/api/admin/Add-new-story/", verifyToken, async (req, res) => {
  jwt.verify(req.token, secretKey, async (err) => {
    if (err) {
      res.status(401);
      res.send({ message: "invalid Token" });
    } else {
      try {
        const id = await Idgenerator();
        if (typeof id != undefined) {
          await Story.create({
            Storyid: id,
            title: req.body.title,
            story: req.body.story,
            questions: req.body.questions,
            category: req.body.category,
          });
          res.status(200);
          res.send({ message: "success" });
        } else {
          res.status(400);
          res.send({ message: "failed" });
        }
      } catch {
        res.status(400);
        res.send({ message: "failed" });
      }
    }
  });
});
app.post("/api/customer/get/category", async (req, res) => {
  const result = await Story.find({});
  const data = [];
  if (result.length != 0) {
    res.status(200);

    result.map((item, index) => {
      data[index] = { category: item.category };
    });

    res.send({ message: "sucess", data: data });
  } else {
    res.status(200);
    res.send("Category does not exist");
  }
});
app.post("/api/customer/get/category/storyname", async (req, res) => {
  const result = await Story.find({
    category: req.body.category,
  });
  const data = [];
  if (result.length != 0) {
    res.status(200);

    result.map((item, index) => {
      data[index] = { title: item.title, id: item.Storyid };
    });

    res.send({ message: "sucess", data: data });
  } else {
    res.status(200);
    res.send("Category does not exist");
  }
});
app.post("/api/customer/get/category/storyWithQ/:id", async (req, res) => {
  const result = await Story.findOne({
    Storyid: req.params.id,
  });

  if (result) {
    const questionAndOption = [];
    result.questions.map((item, index) => {
      const questionData = {
        question: item.questionWithOptions.question,
        options: item.questionWithOptions.options,
      };
      questionAndOption[index] = questionData;
    });
    res.status(200);
    res.send({
      message: "sucess",
      data: questionAndOption,
    });
  } else {
    res.status(200);
    res.send("Story does not exist");
  }
});

app.listen(port, () => console.log(`Server running at  ${port}`));
