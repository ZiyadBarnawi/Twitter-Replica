import { catchAsync } from "./catchAsync.js";
import { OperationalErrors } from "./operationalErrors.js";

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findOneAndDelete({ _id: req.params.id });

    if (!doc) return next(new OperationalErrors("No document found", 404));
    res.status(204).json({ status: "success" });
  });

export const patchOne = (Model, options = null) =>
  catchAsync(async (req, res, next) => {
    if (options.isTweet) {
      req.body.assets = req.files.map((file) => {
        return file.filename;
      });
    }
    const doc = await Model.findOneAndUpdate({ _id: req.params.id }, req.body, {
      lean: true,
      returnDocument: "after",
      runValidators: true,
    });
    if (!doc) return next(new OperationalErrors("No document found", 404));

    res.json({ status: "success", data: { data: doc } });
  });

export const addOne = (Model, options = null) =>
  catchAsync(async (req, res, next) => {
    if (options.isTweet) {
      req.body.assets = req.files.map((file) => {
        return file.filename;
      });
    }
    let doc = await Model.create(req.body);
    res.status(201).json({ status: "success", data: { doc } });
  });
