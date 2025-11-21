// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PredictionMarket {
    enum Outcome { Undecided, Yes, No }
    struct Market {
        address creator;
        string title;
        string metadataURI;
        uint256 endTime;
        uint256 yesPool;
        uint256 noPool;
        Outcome outcome;
        bool resolved;
        uint16 feeBP; // fee basis points, e.g., 100 = 1%
    }

    Market[] public markets;
    address public treasury;
    event MarketCreated(uint256 indexed marketId, address indexed creator, string title, uint256 endTime);
    event BetPlaced(uint256 indexed marketId, address indexed user, bool side, uint256 amount);
    event MarketResolved(uint256 indexed marketId, Outcome outcome);
    event Claimed(uint256 indexed marketId, address indexed user, uint256 amount);

    mapping(uint256 => mapping(address => uint256)) public yesBalances;
    mapping(uint256 => mapping(address => uint256)) public noBalances;
    mapping(uint256 => mapping(address => bool)) public claimed;

    constructor(address _treasury) {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }

    modifier onlyBeforeEnd(uint256 marketId) {
        require(block.timestamp < markets[marketId].endTime, "Market ended");
        _;
    }
    modifier onlyAfterEnd(uint256 marketId) {
        require(block.timestamp >= markets[marketId].endTime, "Market not ended");
        _;
    }

    function createMarket(string calldata title, string calldata metadataURI, uint256 endTime, uint16 feeBP) external returns (uint256) {
        require(endTime > block.timestamp + 60, "endTime too soon");
        require(feeBP <= 1000, "fee too high"); // max 10%
        markets.push(Market(msg.sender, title, metadataURI, endTime, 0, 0, Outcome.Undecided, false, feeBP));
        uint256 id = markets.length - 1;
        emit MarketCreated(id, msg.sender, title, endTime);
        return id;
    }

    function placeBet(uint256 marketId, bool betYes) external payable onlyBeforeEnd(marketId) {
        require(msg.value > 0, "zero bet");
        Market storage m = markets[marketId];
        if (betYes) {
            m.yesPool += msg.value;
            yesBalances[marketId][msg.sender] += msg.value;
        } else {
            m.noPool += msg.value;
            noBalances[marketId][msg.sender] += msg.value;
        }
        emit BetPlaced(marketId, msg.sender, betYes, msg.value);
    }

    // allow creator OR treasury to resolve - simple flow (in production integrate an oracle)
    function resolveMarket(uint256 marketId, bool yesWon) external onlyAfterEnd(marketId) {
        Market storage m = markets[marketId];
        require(!m.resolved, "already resolved");
        require(msg.sender == m.creator || msg.sender == treasury, "not authorized");
        m.resolved = true;
        m.outcome = yesWon ? Outcome.Yes : Outcome.No;
        emit MarketResolved(marketId, m.outcome);
    }

    function claim(uint256 marketId) external {
        Market storage m = markets[marketId];
        require(m.resolved, "not resolved");
        require(!claimed[marketId][msg.sender], "already claimed");
        uint256 userShare;
        uint256 totalWinnerPool;
        uint256 totalLoserPool;
        uint16 fee = m.feeBP;

        if (m.outcome == Outcome.Yes) {
            uint256 userYes = yesBalances[marketId][msg.sender];
            require(userYes > 0, "no winnings");
            totalWinnerPool = m.yesPool;
            totalLoserPool = m.noPool;
            // userShare = userYes + (userYes / totalWinnerPool) * totalLoserPool * (1 - fee)
            uint256 reward = (userYes * totalLoserPool) / totalWinnerPool;
            uint256 feeAmt = (reward * fee) / 10000;
            userShare = userYes + (reward - feeAmt);
            // send fee to treasury
            payable(treasury).transfer(feeAmt);
        } else if (m.outcome == Outcome.No) {
            uint256 userNo = noBalances[marketId][msg.sender];
            require(userNo > 0, "no winnings");
            totalWinnerPool = m.noPool;
            totalLoserPool = m.yesPool;
            uint256 reward = (userNo * totalLoserPool) / totalWinnerPool;
            uint256 feeAmt = (reward * fee) / 10000;
            userShare = userNo + (reward - feeAmt);
            payable(treasury).transfer(feeAmt);
        } else {
            revert("invalid outcome");
        }
        claimed[marketId][msg.sender] = true;
        (bool sent,) = msg.sender.call{value: userShare}("");
        require(sent, "transfer failed");
        emit Claimed(marketId, msg.sender, userShare);
    }

    // helpers
    function marketCount() external view returns (uint256) {
        return markets.length;
    }
}
