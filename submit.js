import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('form parse error', err);
      res.status(500).json({ error: 'Form parse error' });
      return;
    }

    try {
      const photoFile = files.photo;
      let photoDataUrl = '';

      if (photoFile) {
        // file path property differs across versions
        const filePath = photoFile.filepath || photoFile.path || photoFile.file;
        if (filePath && fs.existsSync(filePath)) {
          const buffer = fs.readFileSync(filePath);
          const mime = photoFile.mimetype || photoFile.type || 'image/png';
          photoDataUrl = `data:${mime};base64,${buffer.toString('base64')}`;
        }
      }

      global.submissions = global.submissions || [];
      const submission = {
        name: fields.name || '',
        dob: fields.dob || '',
        gender: fields.gender || '',
        email: fields.email || '',
        phone: fields.phone || '',
        address: fields.address || '',
        course: fields.course || '',
        time: new Date().toISOString(),
        photo: photoDataUrl
      };

      global.submissions.push(submission);
      console.log('New submission:', submission.name, submission.course, submission.time);

      // Optional: Send email here via provider (not included)
      res.status(200).json({ ok: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Server error' });
    }
  });
}
