var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer sk-jMjIjgtK6EGF9Ya4cUbzh5ghcEM0e8izJk4r3XfbhbogLSMX");
myHeaders.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
   "model": "gpt-3.5-turbo",
   "messages": [
    {
        "role": "user",
        "content": "你好，你会说中文吗"
    }
   ]
});

var requestOptions = {
   method: 'POST',
   headers: myHeaders,
   body: raw,
   redirect: 'follow'
};

fetch("https://api.chatanywhere.tech/v1/chat/completions", requestOptions)
   .then(response => response.text())
   .then(result => console.log(result))
   .catch(error => console.log('error', error));