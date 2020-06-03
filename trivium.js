function trivium_generator(key, iv){
    
    var A = [];
    var B = [];
    var C = [];

    for (var i = 0; i < 80; i++){
        let tmp = BigInt(key);
        A.unshift((tmp & 1n) == 1n);
        tmp == tmp >> 1n;
    }
    for (var i = 0; i < 13; i++){
        A.push(false);
    }

    for (var i = 0; i < 80; i++){
        var tmp = BigInt(iv);
        B.unshift((tmp & 1n) == 1n);
        tmp == tmp >> 1n;
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

    for (var i = 0; i < 1152; i++){
        let t1 = A[65] ^ (A[90] & A[91]) ^ A[92] ^ B[77];
        let t2 = B[68] ^ (B[81] & B[82]) ^ B[83] ^ C[86];
        let t3 = C[65] ^ (C[108] & C[109]) ^ C[110] ^ A[68];

        A.pop();
        B.pop();
        C.pop();

        A.unshift(t1);
        B.unshift(t2);
        C.unshift(t3);
    }

//end of whole init

    this.nextBit = function(){
        let t1 = A[65] ^ A[92];
        let t2 = B[68] ^ B[83];
        let t3 = C[65] ^ C[110];

        let z = t1 ^ t2 ^ t3;

        t1 = t1 ^ (A[90] & A[91]) ^ B[77];
        t2 = t2 ^ (B[81] & B[82]) ^ C[86];
        t3 = t3 ^ (C[108] & C[109]) ^ A[68];

        A.pop;
        B.pop;
        C.pop;

        A.unshift(t3);
        B.unshift(t1);
        C.unshift(t2);

        return z;
    }

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
    for(let i = 0; i < str.length; i++){
        dec = order.indexOf(str.charAt(0));
        if(dec == -1){
            break
        }
        str = str.substr(1);
        result = result << 5n;
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

function encrypt(data, key, iv){

    key = base64ToBase10(key);
    iv = base64ToBase10(iv);


    let trivium = new trivium_generator(key,iv);
    data = window.atob(data);
    data = asciiToCharCodes(data);
    let encrypted = [];
    for(let i = 0; i < data.length; i++){
        encrypted[i] = String.fromCharCode(data[i] ^ trivium.nextSeven());
    }
    encrypted = encrypted.reverse();
    encrypted = encrypted.join("");
    encrypted = window.btoa(encrypted);

    return encrypted;
}