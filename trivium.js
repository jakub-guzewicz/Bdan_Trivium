function trivium_generator(key, iv){
    
    var A = [];
    var B = [];
    var C = [];

    var tmp1 = BigInt(key);
    for (var i = 0; i < 80; i++){
        A.unshift((tmp1 & 1n) == 1n);
        tmp1 = tmp1 >> 1n;
    }
    for (var i = 0; i < 13; i++){
        A.push(false);
    }

    var tmp2 = BigInt(iv);
    for (var i = 0; i < 80; i++){
        B.unshift((tmp2 & 1n) == 1n);
        tmp2 = tmp2 >> 1n;
    }
    for (var i = 0; i < 4; i++){
        B.push(false);
    }

    for (var i = 0; i < 108; i++){
        C.push(false);
    }

    C.push(true,true,true);

    //end of first part of init

    //Cheatsheet:
    // A: n-1
    // B: n-94
    // C: n-178

    this.nextBit = function(){
        let t1 = A[65] ^ A[92];
        let t2 = B[68] ^ B[83];
        let t3 = C[65] ^ C[110];

        let z = t1 ^ t2 ^ t3;

        t1 = t1 ^ A[90] & A[91] ^ B[77];
        t2 = t2 ^ B[81] & B[82] ^ C[86];
        t3 = t3 ^ C[108] & C[109] ^ A[68];

        A.pop();
        B.pop();
        C.pop();

        A.unshift(t3);
        B.unshift(t1);
        C.unshift(t2);

        return z;
    }


    for (var i = 0; i < 1152; i++){

        let t1 = A[65] ^ A[90] & A[91] ^ A[92] ^ B[77];
        let t2 = B[68] ^ B[81] & B[82] ^ B[83] ^ C[86];
        let t3 = C[65] ^ C[108] & C[109] ^ C[110] ^ A[68];

        A.pop();
        B.pop();
        C.pop();

        A.unshift(t3);
        B.unshift(t1);
        C.unshift(t2);
    }


//end of whole init

    

    this.nextSeven = function(){
        let result = 0;
        for(let i = 0; i < 7; i++){
            result = result << 1;
            result += this.nextBit();
        }
        return result;
    }
}

function base64ToBase10(str){
    let order = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let dec;
    let result = BigInt(0);
    let n = str.length;
    for(let i = 0; i < n; i++){
        dec = order.indexOf(str.charAt(0));
        if(dec == -1){
            break;
        }
        str = str.substr(1);
        result = result << 6n;
        result += BigInt(dec);
    }
    return result;
}

function asciiToCharCodes(text){
    let dataTable = [];
    for (let i = 0; i < text.length; i++){
        dataTable[i] = text.charCodeAt(text.length - i - 1);
    }
    return dataTable;
}

function charCodesToAscii(charCodes){
    let result = "";
    for (let i = 0; i < charCodes.length; i++){
        result += charCodes[i]
    }
}

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

 function encrypt(data, key, iv){
    
    key = base64ToBase10(key);
    iv = base64ToBase10(iv);
    var trivium = new trivium_generator(key,iv);
    data = atob(data);
    data = asciiToCharCodes(data);

    for(let i = 0; i < data.length; i++){
        data[i] = String.fromCharCode(data[i] ^ trivium.nextSeven());
    }

    data = data.reverse();
    data = data.join("");
    data = btoa(data);
    return data;

}

onmessage = async function(e){
    var base64content = await getBase64(e.data[0]);
    let result = encrypt(base64content, e.data[1], e.data[2]);
    this.postMessage(result);
}