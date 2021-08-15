import MakeComment from "../domain/Comment/MakeComment";
import Comment from "../domain/Comment";

const makeComment: MakeComment = (info): Comment => {
  return new BasicComment(
    { ...info, id: info.id ?? Math.random().toString() },
    info
  );
};

class BasicComment extends Comment {}

export default makeComment;
