export default async function getResponse(prompt, email) {
  console.log('getting response...')
  return fetch('http://localhost:3333/support', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      message: prompt,
    }),
  }).then((res) => res.json()).then((res) => res.response)
}
