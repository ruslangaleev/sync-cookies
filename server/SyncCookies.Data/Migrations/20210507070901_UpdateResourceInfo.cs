using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace SyncCookies.Data.Migrations
{
    public partial class UpdateResourceInfo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActualCookies_ResourceCookies_ResourceCookieId",
                table: "ActualCookies");

            migrationBuilder.DropTable(
                name: "ResourceCookies");

            migrationBuilder.CreateTable(
                name: "ResourceInfoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Url = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResourceInfoes", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_ActualCookies_ResourceInfoes_ResourceCookieId",
                table: "ActualCookies",
                column: "ResourceCookieId",
                principalTable: "ResourceInfoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActualCookies_ResourceInfoes_ResourceCookieId",
                table: "ActualCookies");

            migrationBuilder.DropTable(
                name: "ResourceInfoes");

            migrationBuilder.CreateTable(
                name: "ResourceCookies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Url = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResourceCookies", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_ActualCookies_ResourceCookies_ResourceCookieId",
                table: "ActualCookies",
                column: "ResourceCookieId",
                principalTable: "ResourceCookies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
