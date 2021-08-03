import MakeComment from "../domain/Comment/MakeComment";
import Comment from "../domain/Comment";

const makeComment: MakeComment = (info): Comment => {
  return {
    info: {
      ...info,
      id: info.id ?? Math.random().toString(),
    },
  };
};

export default makeComment;
