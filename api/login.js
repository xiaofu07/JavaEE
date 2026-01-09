export default option =>
  fetch(`${option.base}/login`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: option.user,
      password: option.password
    }),
  })
