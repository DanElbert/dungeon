class Api {

  performRequest(url, method, body, headers = {}) {

    const reqHeaders = new Headers();
    reqHeaders.append('Accept', 'application/json');

    for (let key in headers) {
      reqHeaders.append(key, headers[key]);
    }

    const opts = {
      headers: reqHeaders,
      method: method,
      credentials: "same-origin"
    };

    if (body) {
      opts.body = body;
    }


    return fetch(url, opts);
  }

  getJson(url, params) {
    let body = params || null;
    if (body) {
      body = JSON.stringify(body);
    }
    return this.performRequest(url, "GET", body, {"Content-Type": "application/json"}).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw "invalid response: " + response.status
      }
    })
  }

  postFormData(url, data) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
    return this.performRequest(url, "POST", data, {"X-CSRF-Token": csrfToken}).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw "invalid response: " + response.status
      }
    });
  }

}

export default new Api();