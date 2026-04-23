const userService = require('../../services/userService');
const Restaurant = require('../../models/Restaurant');
const userRepo = require('../../repositories/userRepo');

jest.mock('../../models/Restaurant');
jest.mock('../../repositories/userRepo');

describe('userService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('returns a user with reviewCount when userId is a valid string ObjectId', async () => {
      const userId = '649ebd9c1f2e7b3f0fa864f1';
      userRepo.findUserById.mockResolvedValue({ _id: userId, username: 'testuser' });
      Restaurant.aggregate.mockResolvedValue([{ count: 3 }]);

      const result = await userService.getUser(userId);

      expect(result).toEqual(expect.objectContaining({ username: 'testuser', reviewCount: 3 }));
      expect(Restaurant.aggregate).toHaveBeenCalledWith([
        { $unwind: '$reviews' },
        {
          $match: {
            $or: [
              { 'reviews.userId': userId },
              { 'reviews.userId': expect.any(Object) },
            ],
          },
        },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);

      const matchOr = Restaurant.aggregate.mock.calls[0][0][1].$match.$or;
      expect(matchOr[0]['reviews.userId']).toBe(userId);
      expect(matchOr[1]['reviews.userId'].toString()).toBe(userId);
    });

    it('returns reviewCount 0 when no reviews exist', async () => {
      const userId = '649ebd9c1f2e7b3f0fa864f1';
      userRepo.findUserById.mockResolvedValue({ _id: userId, username: 'testuser' });
      Restaurant.aggregate.mockResolvedValue([]);

      const result = await userService.getUser(userId);

      expect(result.reviewCount).toBe(0);
    });
  });
});
