interface UserProfile {
    Username?: string;
    Email?: string;
    Role?: string;
    RoleId?: number | string;
    Avatar?: string;
    [key: string]: any;
}