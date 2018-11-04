class Api {

  performRequest(url, method, params = {}, headers = {}) {
    const hasBody = Object.keys(params || {}).length !== 0;

    const reqHeaders = new Headers();
    reqHeaders.append('Accept', 'application/json');
    reqHeaders.append('Content-Type', 'application/json');

    for (let key in headers) {
      reqHeaders.append(key, headers[key]);
    }

    const opts = {
      headers: reqHeaders,
      method: method,
      credentials: "same-origin"
    };

    if (hasBody) {
      opts.body = JSON.stringify(params);
    }

    return fetch(url, opts);
  }

  getJson(url, params = {}) {
    return this.performRequest(url, "GET", params).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw "invalid response: " + response.status
      }
    })
  }

}

export default new Api();