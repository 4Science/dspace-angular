export default class CookieService {
  static getCookie(name) {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
    return match ? { name, value: match[1] } : null;
  }
}
