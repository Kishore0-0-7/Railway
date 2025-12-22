const db = require("../config/db");

const closeBooking = async (req, res) => {
    const { adminId, workerId } = req.params;

    try {
        const result = await db.query(
            `SELECT 
                booking_id,
                guest_name,
                phone_number,
                number_of_persons,
                booking_type,
                status
             FROM public.bookings
             WHERE admin_id = $1
               AND worker_id = $2
               AND booking_date = CURRENT_DATE`,
            [adminId, workerId]
        );

        // ✅ If no bookings found
        if (result.rows.length === 0) {
            return res.status(200).json({
                success: false,
                message: "There is no booking done by today’s worker"
            });
        }

        // ✅ If bookings exist
        res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching today's bookings"
        });
    }
};



const getWorkerDashboard = async (req, res) => {
    const { adminId, workerId } = req.params;

    try {
        // 1️⃣ Balance (from worker_accounts table)
        const balanceResult = await db.query(
            `SELECT COALESCE(balance, 0) AS balance
             FROM public.worker_accounts
             WHERE admin_id = $1 AND worker_id = $2`,
            [adminId, workerId]
        );

        const balanceAmount =
            balanceResult.rows.length > 0
                ? Number(balanceResult.rows[0].balance)
                : 0;

        // 2️⃣ Today's bookings
        const todayBookings = await db.query(
            `SELECT COUNT(*) AS count
             FROM bookings
             WHERE admin_id = $1
               AND worker_id = $2
               AND booking_date = CURRENT_DATE`,
            [adminId, workerId]
        );

        // 3️⃣ Completed bookings + total (today)
        const completed = await db.query(
            `SELECT 
                COUNT(*) FILTER (WHERE status = 'Completed') AS completed,
                COUNT(*) AS total
             FROM bookings
             WHERE admin_id = $1
               AND worker_id = $2
               AND booking_date = CURRENT_DATE`,
            [adminId, workerId]
        );

        const completedCount = Number(completed.rows[0].completed);
        const totalToday = Number(completed.rows[0].total);
        const completionRate =
            totalToday === 0
                ? "0%"
                : `${((completedCount / totalToday) * 100).toFixed(1)}%`;

        // 4️⃣ Active bookings by type
        const activeByTypeResult = await db.query(
            `SELECT booking_type, COUNT(*) AS count
             FROM bookings
             WHERE admin_id = $1
               AND worker_id = $2
               AND status = 'Active'
             GROUP BY booking_type`,
            [adminId, workerId]
        );

        // Normalize Sitting / Sleeping counts
        const activeBookingsByType = {
            Sitting: 0,
            Sleeping: 0
        };

        activeByTypeResult.rows.forEach(row => {
            activeBookingsByType[row.booking_type] = Number(row.count);
        });

        // 5️⃣ Total revenue
        const revenue = await db.query(
            `SELECT COALESCE(SUM(paid_amount), 0) AS revenue
             FROM bookings
             WHERE admin_id = $1 AND worker_id = $2`,
            [adminId, workerId]
        );

        // 6️⃣ Total bookings
        const totalBookings = await db.query(
            `SELECT COUNT(*) AS total
             FROM bookings
             WHERE admin_id = $1 AND worker_id = $2`,
            [adminId, workerId]
        );

        // ✅ Final response
        res.status(200).json({
            balanceAmount,
            todaysBookings: Number(todayBookings.rows[0].count),
            completed: completedCount,
            completionRate,
            activeBookingsByType,
            totalRevenue: Number(revenue.rows[0].revenue),
            totalBookings: Number(totalBookings.rows[0].total)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Dashboard data error"
        });
    }
};

const updateWorkerBalance = async (req, res) => {
    const { adminId, workerId } = req.params;

    try {
        const result = await db.query(
            `UPDATE public.worker_accounts
             SET balance = 0,
                 updated_at = NOW()
             WHERE admin_id = $1
               AND worker_id = $2
             RETURNING worker_id, admin_id, balance`,
            [adminId, workerId]
        );

        // If no worker found
        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Worker not found for given admin"
            });
        }

        res.status(200).json({
            success: true,
            message: "Worker balance reset to zero",
            data: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Error updating worker balance"
        });
    }
};



module.exports = {
    closeBooking,
    getWorkerDashboard,
    updateWorkerBalance
};
