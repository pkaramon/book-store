export default interface EmailTemplate {
  (context: any): string;
}
