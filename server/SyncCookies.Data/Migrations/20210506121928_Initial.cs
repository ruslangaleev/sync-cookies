using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace SyncCookies.Data.Migrations
{
    public partial class Initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.CreateTable(
                name: "ActualCookies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Value = table.Column<string>(type: "text", nullable: true),
                    Domain = table.Column<string>(type: "text", nullable: true),
                    ResourceCookieId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActualCookies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActualCookies_ResourceCookies_ResourceCookieId",
                        column: x => x.ResourceCookieId,
                        principalTable: "ResourceCookies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ActualCookies_ResourceCookieId",
                table: "ActualCookies",
                column: "ResourceCookieId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActualCookies");

            migrationBuilder.DropTable(
                name: "ResourceCookies");
        }
    }
}
