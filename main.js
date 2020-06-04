 async function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
        if ((encoded.length % 4) > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });
  }

async function encryptFile(){
    const selectedFile = document.getElementById('inputfile').files[0];
    const iv = document.getElementById('iv').value;
    const key = document.getElementById('key').value;
    
    var myWorker = new Worker('trivium.js');

    myWorker.postMessage([selectedFile, key, iv]);

    myWorker.onmessage = function(e) {
        var hiddenElement = document.createElement('a');
        hiddenElement.download = 'encrypted_'+selectedFile.name;
        hiddenElement.href = 'data:application/octet-stream;base64,'+e.data;
        hiddenElement.target = '_blank';
        hiddenElement.click();
    }


}