const mongoose = require("mongoose");

const Story = new mongoose.Schema(
  {
    Storyid: { type: Number },
    title: { type: String },
    story: { type: String, require: true },
    questions: [
      {
        questionWithOptions: {
          question: { type: String, require: true },
          options: { type: Array, require: true },
          correctOption: { type: Array, require: true },
        },
      },
    ],
    category: { type: String, require: true },
  },
  { Collection: "AdminData" }
);

const model = mongoose.model("StoryModel", Story);
module.exports = model;
