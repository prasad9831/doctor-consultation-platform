const { exec } = require("child_process");

function transcribeAudio(filePath) {
  return new Promise((resolve, reject) => {

    exec(`python whisper_service.py ${filePath}`, (err, stdout) => {

      if (err) {
        console.error(err);
        return reject(err);
      }

      try {
        const data = JSON.parse(stdout);
        resolve(data.text);
      } catch (e) {
        reject("Parse error");
      }

    });

  });
}

module.exports = { transcribeAudio };

