import { prisma } from "./prisma";

export class UsernameGenerator {
  static async generateUniqueUsername(name: string, email: string): Promise<string> {
    // Create base username from name or email
    let baseUsername = this.sanitizeName(name) || this.getEmailPrefix(email);
    baseUsername = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Ensure minimum length
    if (baseUsername.length < 3) {
      baseUsername = 'user' + baseUsername;
    }
    
    // Truncate if too long
    if (baseUsername.length > 45) {
      baseUsername = baseUsername.substring(0, 45);
    }

    let username = baseUsername;
    let counter = 1;

    // Check uniqueness and add numbers if needed
    while (await this.isUsernameTaken(username)) {
      const suffix = counter.toString();
      const maxBaseLength = 50 - suffix.length;
      username = baseUsername.substring(0, maxBaseLength) + suffix;
      counter++;
    }

    return username;
  }

  private static sanitizeName(name: string): string {
    return name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
  }

  private static getEmailPrefix(email: string): string {
    return email.split('@')[0];
  }

  private static async isUsernameTaken(username: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    return user !== null;
  }
}