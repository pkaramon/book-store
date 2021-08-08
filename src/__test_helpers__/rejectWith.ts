export default function rejectWith(error: any) {
  return jest.fn().mockRejectedValue(error);
}

