module.exports = {
  get: jest.fn(() => Promise.resolve({ status: 200 })),
  post: jest.fn(() => Promise.resolve({ status: 200 })),
  put: jest.fn(() => Promise.resolve({ status: 200 })),
  del: jest.fn(() => Promise.resolve({ status: 200 })),
  requestsArr: []
}
