﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using SyncCookies.Data;

namespace SyncCookies.Data.Migrations
{
    [DbContext(typeof(ApplicationContext))]
    [Migration("20210506121928_Initial")]
    partial class Initial
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("Relational:MaxIdentifierLength", 63)
                .HasAnnotation("ProductVersion", "5.0.5")
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            modelBuilder.Entity("SyncCookies.Models.ActualCookie", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Domain")
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.Property<Guid>("ResourceCookieId")
                        .HasColumnType("uuid");

                    b.Property<string>("Value")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("ResourceCookieId");

                    b.ToTable("ActualCookies");
                });

            modelBuilder.Entity("SyncCookies.Models.ResourceCookie", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Url")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("ResourceCookies");
                });

            modelBuilder.Entity("SyncCookies.Models.ActualCookie", b =>
                {
                    b.HasOne("SyncCookies.Models.ResourceCookie", "ResourceCookie")
                        .WithMany("ActualCookies")
                        .HasForeignKey("ResourceCookieId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ResourceCookie");
                });

            modelBuilder.Entity("SyncCookies.Models.ResourceCookie", b =>
                {
                    b.Navigation("ActualCookies");
                });
#pragma warning restore 612, 618
        }
    }
}
