 const API_URL="https://api.anthropic.com/v1/messages"

const API_KEY = prompt("Enter your API key")

const input=document.getElementById("profileInput")
const button=document.getElementById("generateButton")
const result=document.getElementById("result")
const error=document.getElementById("error")
const copy=document.getElementById("copyBtn")

async function generate(){

error.textContent=""
result.style.display="none"

const text=input.value.trim()

if(!text){
error.textContent="Please enter your experience first."
return
}

button.disabled=true
button.innerText="Generating..."

try{

const response=await fetch(API_URL,{
method:"POST",
headers:{
"Content-Type":"application/json",
"x-api-key":API_KEY,
"anthropic-version":"2023-06-01",
"anthropic-dangerous-direct-browser-access":"true"
},
body:JSON.stringify({

model:"claude-3-sonnet-20240229",

max_tokens:400,

messages:[{
role:"user",
content:`You are an expert career coach.

Write a strong LinkedIn "About" summary based on the information below.

Rules:
- Maximum 3 paragraphs
- Maximum 220 words
- No bullet points
- Confident tone

User input:
${text}`
}]

})
})

const data=await response.json()

if(!response.ok){
throw new Error(data.error?.message || "API error")
}

const summary=data.content?.[0]?.text || "No response"

result.innerText=summary
result.style.display="block"
copy.style.display="block"

}catch(e){

error.textContent=e.message

}finally{

button.disabled=false
button.innerText="Generate Summary"

}

}

async function copyText(){

const text=result.innerText

await navigator.clipboard.writeText(text)

copy.innerText="Copied!"

setTimeout(()=>{
copy.innerText="Copy"
},2000)

}

button.addEventListener("click",generate)

copy.addEventListener("click",copyText)

input.addEventListener("keydown",(e)=>{
if((e.ctrlKey || e.metaKey) && e.key==="Enter"){
generate()
}
})
