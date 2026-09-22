const Draw = require("../models/Draw");

const hashString = (value) => {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
};

const generateDrawWinners = (pool, totalWinners, selectionMethod = "random", dateSeed = Date.now()) => {
    const uniquePool = [...new Set(pool.map((id) => String(id)))];
    if (uniquePool.length === 0) return [];

    if (selectionMethod === "algorithmic") {
        return uniquePool
            .map((userId) => ({
                user: userId,
                score: hashString(`${userId}-${dateSeed}`) % 100000,
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, Math.min(totalWinners, uniquePool.length))
            .map(({ user, score }) => ({ user, score }));
    }

    const shuffled = [...uniquePool];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(((hashString(`${shuffled[i]}-${dateSeed}`) + i) % (i + 1)));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, Math.min(totalWinners, uniquePool.length)).map((user) => ({ user }));
};

const joinDraw = async (req, res) => {
    try {
        const { drawId } = req.body;

        if (!drawId) {
            return res.status(400).json({ message: "Draw ID is required" });
        }

        const draw = await Draw.findById(drawId);
        if (!draw) {
            return res.status(404).json({ message: "Draw not found" });
        }

        const userId = req.user._id.toString();
        const alreadyJoined = draw.participants.some((id) => id.toString() === userId);

        if (alreadyJoined) {
            return res.status(409).json({ message: "User already joined this draw" });
        }

        draw.participants.push(req.user._id);
        await draw.save();

        return res.status(200).json({ message: "Joined draw successfully", draw });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not join draw" });
    }
};

const createDraw = async (req, res) => {
    try {
        const { title, description, prize, winnerCount, participants, selectionMethod, drawDate } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Draw title is required" });
        }

        const totalWinners = Math.max(1, Number(winnerCount || 1));
        const selectedParticipants = Array.isArray(participants) ? participants : [];
        const selectedMethod = ["random", "algorithmic"].includes(selectionMethod) ? selectionMethod : "random";
        const drawDay = drawDate ? new Date(drawDate) : new Date();

        const draw = await Draw.create({
            title,
            description: description || "",
            prize: prize || "",
            selectionMethod: selectedMethod,
            drawDate: drawDay,
            winnerCount: totalWinners,
            participants: selectedParticipants,
            createdBy: req.user._id,
            status: "running",
        });

        if (selectedParticipants.length > 0) {
            const generatedWinners = generateDrawWinners(selectedParticipants, totalWinners, selectedMethod, drawDay.getTime());

            draw.winners = generatedWinners.map((winner) => ({
                user: winner.user,
                prize: prize || "Prize",
                payoutStatus: "pending",
                verified: false,
            }));

            await draw.save();
        }

        return res.status(201).json({ message: "Draw configured and run successfully", draw });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not create draw" });
    }
};

const getDrawResults = async (req, res) => {
    try {
        const draws = await Draw.find()
            .populate("participants", "name email")
            .populate("winners.user", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({ draws });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not fetch draw results" });
    }
};

const verifyWinners = async (req, res) => {
    try {
        const { drawId, winnerIds } = req.body;

        if (!drawId) {
            return res.status(400).json({ message: "Draw ID is required" });
        }

        const draw = await Draw.findById(drawId);
        if (!draw) {
            return res.status(404).json({ message: "Draw not found" });
        }

        const winnersToVerify = winnerIds && winnerIds.length ? winnerIds : draw.winners.map((w) => w._id);

        draw.winners = draw.winners.map((winner) => {
            if (winnersToVerify.includes(String(winner._id))) {
                winner.verified = true;
                winner.payoutStatus = "approved";
            }
            return winner;
        });

        draw.status = "verified";
        await draw.save();

        return res.status(200).json({ message: "Winners verified successfully", draw });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not verify winners" });
    }
};

const uploadWinnerProof = async (req, res) => {
    try {
        const { drawId, winnerId, proofUrl } = req.body;

        if (!drawId || !winnerId || !proofUrl) {
            return res.status(400).json({ message: "Draw ID, winner ID, and proof URL are required" });
        }

        const draw = await Draw.findById(drawId);
        if (!draw) {
            return res.status(404).json({ message: "Draw not found" });
        }

        const winner = draw.winners.find((item) => String(item._id) === String(winnerId));
        if (!winner) {
            return res.status(404).json({ message: "Winner not found in this draw" });
        }

        winner.proofUrl = proofUrl;
        await draw.save();

        return res.status(200).json({ message: "Winner proof uploaded successfully", winner });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not upload proof" });
    }
};

module.exports = { joinDraw, createDraw, getDrawResults, verifyWinners, uploadWinnerProof };
