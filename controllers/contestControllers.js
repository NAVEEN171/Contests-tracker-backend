const { getConnection } = require("../config/db.config");
const { ObjectId } = require("mongodb");

const getSavedContests = async (req, res) => {
  try {
    const { contestIds } = req.body;

    const dbConn = await getConnection();

    const db = dbConn.useDb("coding-contests");
    const Contests = db.collection("Contests");
    if (!contestIds || !Array.isArray(contestIds) || contestIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of contest IDs",
      });
    }

    // Convert string IDs to ObjectId in a single map operation
    const objectIds = contestIds.map((id) => ObjectId.createFromHexString(id));

    // Find contests with the provided IDs
    const savedContests = await Contests.find({
      _id: { $in: objectIds },
    }).toArray();

    return res.status(200).json({
      data: savedContests,
    });
  } catch (error) {
    console.error("Error fetching saved contests:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching saved contests",
    });
  }
};

const getSolutions = async (req, res, next) => {
  try {
    let contestId = req.params.id;

    if (!contestId) {
      return res.status(400).json({
        message: "contestId is missing",
      });
    }

    // Validate if the ID is a valid ObjectId
    if (!ObjectId.isValid(contestId)) {
      return res.status(400).json({
        message: "Invalid contest ID format",
      });
    }
    const dbConn = await getConnection();

    const db = dbConn.useDb("coding-contests");
    const Contests = db.collection("Contests");

    let existingContest = await Contests.findOne({
      _id: new ObjectId(contestId),
    });

    if (!existingContest) {
      return res.status(404).json({
        message: "Contest not found",
      });
    }

    return res.status(200).json({
      Solutions: existingContest.youtubeLinks || [],
      ContestName: existingContest.contestName || "",
      Platform: existingContest.Platform || "",
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getContests = async (req, res, next) => {
  try {
    const dbConn = await getConnection();

    const db = dbConn.useDb("coding-contests");

    const Contests = db.collection("Contests");
    const params = req.query;
    const MAX_CONTEST_PER_PAGE = 6;
    const page = Number(params.Page) || 1;
    let and_query = [];
    const pipeline = [];

    // Your existing query building logic remains the same
    if (params.Solutions && JSON.parse(params.Solutions)) {
      and_query.push({
        youtubeLinks: { $exists: true, $ne: [] },
      });
    }

    if (params.Active && JSON.parse(params.Active)) {
      let statusList = ["Active"];
      and_query.push({
        Status: {
          $in: statusList,
        },
      });
    } else if (params.Status) {
      let statusList = params.Status.split(",");

      and_query.push({
        Status: {
          $in: statusList,
        },
      });
    }

    if (params.Platform) {
      let platformList = params.Platform.split(",");
      and_query.push({
        Platform: {
          $in: platformList,
        },
      });
    }

    if (params.ContestPeriod) {
      let durationList = params.ContestPeriod.split(",");
      const startDate = new Date(`${durationList[0]}T00:00:00Z`);

      const endDate = new Date(`${durationList[1]}T23:59:59Z`);
      and_query.push({
        startTime: {
          $gte: startDate.toISOString(),
          $lte: endDate.toISOString(),
        },
      });
    }

    if (params.duration) {
      let durationValue = Number(params.duration);
      and_query.push({
        $expr: {
          $let: {
            vars: {
              hoursPart: {
                $toInt: { $arrayElemAt: [{ $split: ["$duration", ":"] }, 0] },
              },
              minutesPart: {
                $toInt: { $arrayElemAt: [{ $split: ["$duration", ":"] }, 1] },
              },
            },
            in: {
              $or: [
                { $lt: ["$$hoursPart", durationValue] }, // Hours less than 2
                {
                  $and: [
                    { $eq: ["$$hoursPart", durationValue] }, // Hours equal to 2
                    { $eq: ["$$minutesPart", 0] }, // Minutes must be 0
                  ],
                },
              ],
            },
          },
        },
      });
    }

    if (and_query.length > 0) {
      pipeline.push({
        $match: { $and: and_query },
      });
    }

    if (params.Latest && JSON.parse(params.Latest)) {
      pipeline.push({
        $sort: {
          startTime: -1,
        },
      });
    }

    pipeline.push({
      $facet: {
        totalCount: [{ $count: "count" }],
        paginatedContests: [
          { $skip: (page - 1) * MAX_CONTEST_PER_PAGE },
          { $limit: MAX_CONTEST_PER_PAGE },
        ],
      },
    });

    pipeline.push({
      $project: {
        totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
        paginatedContests: 1,
      },
    });

    let results = await Contests.aggregate(pipeline);
    results = await results.toArray();

    if (results.length > 0) {
      let maxPages = results[0].totalCount;
      let fullPages = Math.floor(maxPages / MAX_CONTEST_PER_PAGE);
      if (maxPages % MAX_CONTEST_PER_PAGE > 0) {
        fullPages = fullPages + 1;
      }
      res.status(200).json({
        totalCount: results[0].totalCount || 0,
        contests: results[0].paginatedContests || [],
        maxPaginatedPages: fullPages,
      });
    } else {
      res.status(200).json({
        totalCount: 0,
        contests: [],
        maxPaginatedPages: 0,
      });
    }
  } catch (error) {
    console.error("Error in get-contests route:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getSavedContests,
  getSolutions,
  getContests,
};
