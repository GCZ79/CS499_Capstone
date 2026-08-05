/**
 * tests/validate.test.js — Unit tests for validateQuery middleware
 * Tests input validation in isolation without involving the database.
 * Focuses on the security boundary: ensuring malformed or unexpected
 * query parameters are rejected before reaching the route handler.
 */

const { validateQuery } = require('../middleware/validate');

// Helper to build mock Express req, res, and next objects
const mockReq = (query = {}) => ({ query });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

beforeEach(() => {
  mockNext.mockClear();
});

// *** rescueType ***

describe('validateQuery — rescueType', () => {

  test('passes for valid rescue type: water', () => {
    const req = mockReq({ rescueType: 'water' });
    const res = mockRes();
    validateQuery(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('passes for valid rescue type: mountain', () => {
    const req = mockReq({ rescueType: 'mountain' });
    const res = mockRes();
    validateQuery(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test('passes for valid rescue type: disaster', () => {
    const req = mockReq({ rescueType: 'disaster' });
    const res = mockRes();
    validateQuery(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test('passes for valid rescue type: reset', () => {
    const req = mockReq({ rescueType: 'reset' });
    const res = mockRes();
    validateQuery(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test('rejects unknown rescue type', () => {
    const req = mockReq({ rescueType: 'unknown' });
    const res = mockRes();
    validateQuery(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid rescue type' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('rejects SQL injection attempt in rescueType', () => {
    const req = mockReq({ rescueType: "' OR '1'='1" });
    const res = mockRes();
    validateQuery(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('passes when rescueType is absent', () => {
    const req = mockReq({});
    const res = mockRes();
    validateQuery(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

});

// *** page ***

describe('validateQuery — page', () => {

  test('passes for page=0', () => {
    const req = mockReq({ page: '0' });
    const res = mockRes();
    validateQuery(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test('passes for page=5', () => {
    const req = mockReq({ page: '5' });
    const res = mockRes();
    validateQuery(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test('rejects negative page', () => {
    const req = mockReq({ page: '-1' });
    const res = mockRes();
    validateQuery(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('rejects non-numeric page', () => {
    const req = mockReq({ page: 'abc' });
    const res = mockRes();
    validateQuery(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

});

// *** pageSize ***

describe('validateQuery — pageSize', () => {

  test('passes for pageSize=10', () => {
    const req = mockReq({ pageSize: '10' });
    const res = mockRes();
    validateQuery(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test('passes for pageSize=100 (boundary)', () => {
    const req = mockReq({ pageSize: '100' });
    const res = mockRes();
    validateQuery(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test('rejects pageSize=0', () => {
    const req = mockReq({ pageSize: '0' });
    const res = mockRes();
    validateQuery(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('rejects pageSize=101 (exceeds cap)', () => {
    const req = mockReq({ pageSize: '101' });
    const res = mockRes();
    validateQuery(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('rejects non-numeric pageSize', () => {
    const req = mockReq({ pageSize: 'large' });
    const res = mockRes();
    validateQuery(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

});