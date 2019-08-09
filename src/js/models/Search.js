import axios from "axios";
import { base, key } from "../config";

export default class Search {
  constructor(query) {
    this.query = query;
  }

  async getResults() {
    // If access was banned by CORS rules, use the proxy below
    // const proxy = "https://cors-anywhere.herokuapp.com";
    // const key = "4ecb04a23f931a4cc8a27f535a3aafad";

    try {
      const res = await axios(`${base}search?key=${key}&q=${this.query}`);
      this.result = res.data.recipes;
      console.log(res);
    } catch (error) {
      alert(error);
    }
  }
}
