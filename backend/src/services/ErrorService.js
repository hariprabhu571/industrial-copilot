class ErrorService {
  constructor(dbQuery) {
    this.query = dbQuery.query || dbQuery;
  }

  async getAllErrorCodes() {
    const result = await this.query('SELECT * FROM error_codes LIMIT 5');
    return result.rows;
  }
}

export default ErrorService;