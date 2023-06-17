import * as mongoose from "mongoose"

export const validatemongodbId = (id) => {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new Error("This id is not valid");
};