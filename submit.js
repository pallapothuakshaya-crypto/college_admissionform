import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // let formidable handle file parsing
  },
};

let submissions = [];

export default async function handler(req, res) {
  if (req.method === "POST") {
    const form = formidable({ multiples: false, uploadDir: "/tmp", keepExtensions: true });

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: "Error parsing form" });
        return;
      }

      const submission = {
        id: Date.now(),
        ...fields,
        photo: files.photo ? files.photo.filepath : null,
      };

      submissions.push(submission);

      console.log("New submission:", submission);

      res.status(200).json({ message: "Form submitted successfully!" });
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
