using System;
using System.Collections.Generic;

namespace SmartRealEstate.Models
{
    /// <summary>
    /// User role enumeration
    /// </summary>
    public enum UserRole
    {
        Admin,          // Full system access
        Agent,          // Real estate agent - can manage listings
        Manager,        // Property manager - can manage properties
        Customer,       // Buyer/Renter - can search and compare
        Guest          // Limited access
    }

    /// <summary>
    /// Represents a user in the system
    /// </summary>
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PasswordHash { get; set; }
        public string PhoneNumber { get; set; }
        public UserRole Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public List<string> Permissions { get; set; } = new List<string>();
    }

    /// <summary>
    /// Role-based permissions
    /// </summary>
    public class RolePermission
    {
        public int Id { get; set; }
        public UserRole Role { get; set; }
        public string PermissionName { get; set; }
        public string Description { get; set; }
    }

    /// <summary>
    /// Available permissions in the system
    /// </summary>
    public static class Permissions
    {
        // Property Management
        public const string ViewProperties = "view_properties";
        public const string CreateProperty = "create_property";
        public const string EditProperty = "edit_property";
        public const string DeleteProperty = "delete_property";
        public const string PublishProperty = "publish_property";

        // User Management
        public const string ViewUsers = "view_users";
        public const string CreateUser = "create_user";
        public const string EditUser = "edit_user";
        public const string DeleteUser = "delete_user";
        public const string ManageRoles = "manage_roles";

        // Comparison & Analysis
        public const string CompareProperties = "compare_properties";
        public const string ViewAnalytics = "view_analytics";

        // Chatbot
        public const string UseChat = "use_chat";

        // Settings
        public const string ViewSettings = "view_settings";
        public const string EditSettings = "edit_settings";

        // Reports
        public const string ViewReports = "view_reports";
        public const string GenerateReports = "generate_reports";

        // Transactions
        public const string ViewTransactions = "view_transactions";
        public const string ProcessTransactions = "process_transactions";
    }

    /// <summary>
    /// Role permission mappings
    /// </summary>
    public static class RolePermissions
    {
        public static Dictionary<UserRole, List<string>> GetPermissionsByRole()
        {
            return new Dictionary<UserRole, List<string>>
            {
                {
                    UserRole.Admin, new List<string>
                    {
                        // All permissions
                        Permissions.ViewProperties,
                        Permissions.CreateProperty,
                        Permissions.EditProperty,
                        Permissions.DeleteProperty,
                        Permissions.PublishProperty,
                        Permissions.ViewUsers,
                        Permissions.CreateUser,
                        Permissions.EditUser,
                        Permissions.DeleteUser,
                        Permissions.ManageRoles,
                        Permissions.CompareProperties,
                        Permissions.ViewAnalytics,
                        Permissions.UseChat,
                        Permissions.ViewSettings,
                        Permissions.EditSettings,
                        Permissions.ViewReports,
                        Permissions.GenerateReports,
                        Permissions.ViewTransactions,
                        Permissions.ProcessTransactions
                    }
                },
                {
                    UserRole.Agent, new List<string>
                    {
                        Permissions.ViewProperties,
                        Permissions.CreateProperty,
                        Permissions.EditProperty,
                        Permissions.PublishProperty,
                        Permissions.CompareProperties,
                        Permissions.UseChat,
                        Permissions.ViewReports,
                        Permissions.ViewTransactions,
                        Permissions.ProcessTransactions
                    }
                },
                {
                    UserRole.Manager, new List<string>
                    {
                        Permissions.ViewProperties,
                        Permissions.EditProperty,
                        Permissions.CompareProperties,
                        Permissions.ViewAnalytics,
                        Permissions.UseChat,
                        Permissions.ViewReports,
                        Permissions.ViewTransactions
                    }
                },
                {
                    UserRole.Customer, new List<string>
                    {
                        Permissions.ViewProperties,
                        Permissions.CompareProperties,
                        Permissions.UseChat
                    }
                },
                {
                    UserRole.Guest, new List<string>
                    {
                        Permissions.ViewProperties
                    }
                }
            };
        }

        public static List<string> GetPermissionsForRole(UserRole role)
        {
            var permissions = GetPermissionsByRole();
            return permissions.ContainsKey(role) ? permissions[role] : new List<string>();
        }

        public static bool HasPermission(UserRole role, string permission)
        {
            var permissions = GetPermissionsForRole(role);
            return permissions.Contains(permission);
        }
    }
}
