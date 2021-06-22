using Microsoft.EntityFrameworkCore.Migrations;

namespace SyncCookies.Data.Migrations
{
    public partial class UpdateTypeExpirationDate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ExpirationDate",
                table: "ActualCookies",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpirationDate",
                table: "ActualCookies");
        }
    }
}
