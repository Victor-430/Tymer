import * as Yup from "yup";

export const dateRangeSchema = Yup.object({
  start_date: Yup.string().required("Choose a start date.").test("valid-date", "Choose a valid date.", (v) => Boolean(v && !Number.isNaN(Date.parse(v)))),
  end_date: Yup.string().required("Choose an end date.").test("valid-date", "Choose a valid date.", (v) => Boolean(v && !Number.isNaN(Date.parse(v))))
    .test("range", "End date must be on or after the start date.", function (v) { return !v || !this.parent.start_date || v >= this.parent.start_date; }),
});
